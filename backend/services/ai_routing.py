import asyncio
import re
from typing import Dict, List, Optional, Tuple
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from sqlalchemy.orm import Session
from uuid import UUID
import json

from core.config import settings
from models.database import AIConversation, Task, Idea, User

class AIRoutingService:
    def __init__(self, db: Session, user_id: UUID):
        self.db = db
        self.user_id = user_id
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def process_message(self, message: str, thread_id: Optional[UUID] = None) -> Dict:
        """Process a message with @mention routing"""
        
        # Parse @mentions
        mentions = self._parse_mentions(message)
        clean_message = self._remove_mentions(message)
        
        # Get or create conversation thread
        conversation = await self._get_or_create_thread(thread_id)
        
        # Get relevant context
        context = await self._gather_context()
        
        # Route to appropriate AI(s)
        responses = await self._route_message(clean_message, mentions, context)
        
        # Store the conversation
        await self._store_conversation(conversation, message, responses)
        
        return {
            'responses': responses,
            'thread_id': conversation.id,
            'context_used': context
        }

    def _parse_mentions(self, message: str) -> List[str]:
        """Extract @mentions from message"""
        mentions = re.findall(r'@(\w+)', message)
        return [mention.lower() for mention in mentions]

    def _remove_mentions(self, message: str) -> str:
        """Remove @mentions from message for AI processing"""
        return re.sub(r'@\w+\s*', '', message).strip()

    async def _route_message(self, message: str, mentions: List[str], context: Dict) -> List[Dict]:
        """Route message to appropriate AI(s) based on mentions"""
        responses = []
        
        if not mentions or 'all' in mentions:
            # No mention or @all - route to both
            tasks = []
            if not mentions:
                # Smart routing based on content
                if self._is_technical_query(message):
                    tasks.append(self._call_claude(message, context))
                else:
                    tasks.append(self._call_chatgpt(message, context))
            else:
                # @all - call both
                tasks.extend([
                    self._call_claude(message, context),
                    self._call_chatgpt(message, context)
                ])
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for result in results:
                if not isinstance(result, Exception):
                    responses.append(result)
        
        else:
            # Specific mentions
            tasks = []
            if 'claude' in mentions:
                tasks.append(self._call_claude(message, context))
            if 'chatgpt' in mentions or 'gpt' in mentions:
                tasks.append(self._call_chatgpt(message, context))
            
            if tasks:
                results = await asyncio.gather(*tasks, return_exceptions=True)
                for result in results:
                    if not isinstance(result, Exception):
                        responses.append(result)
        
        return responses

    def _is_technical_query(self, message: str) -> bool:
        """Determine if query should go to Claude (technical) or ChatGPT (creative)"""
        technical_keywords = [
            'implement', 'code', 'function', 'api', 'database', 'algorithm',
            'debug', 'error', 'technical', 'architecture', 'deploy', 'build',
            'sql', 'python', 'javascript', 'docker', 'server'
        ]
        
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in technical_keywords)

    async def _call_claude(self, message: str, context: Dict) -> Dict:
        """Call Claude API with context"""
        try:
            # Build context-aware prompt
            system_prompt = self._build_claude_system_prompt(context)
            
            response = await self.anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1000,
                system=system_prompt,
                messages=[{
                    "role": "user",
                    "content": message
                }]
            )
            
            return {
                'ai': 'claude',
                'content': response.content[0].text,
                'model': 'claude-3-5-sonnet',
                'tokens_used': response.usage.input_tokens + response.usage.output_tokens
            }
        
        except Exception as e:
            return {
                'ai': 'claude',
                'content': f"Error calling Claude: {str(e)}",
                'error': True
            }

    async def _call_chatgpt(self, message: str, context: Dict) -> Dict:
        """Call ChatGPT API with context"""
        try:
            # Build context-aware prompt
            system_prompt = self._build_chatgpt_system_prompt(context)
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                max_tokens=1000
            )
            
            return {
                'ai': 'chatgpt',
                'content': response.choices[0].message.content,
                'model': 'gpt-4-turbo',
                'tokens_used': response.usage.total_tokens
            }
        
        except Exception as e:
            return {
                'ai': 'chatgpt',
                'content': f"Error calling ChatGPT: {str(e)}",
                'error': True
            }

    def _build_claude_system_prompt(self, context: Dict) -> str:
        """Build system prompt for Claude with current context"""
        prompt = """You are Claude, the engineering AI assistant for Rhythmiq Personal OS. You help with technical implementation, code review, architecture decisions, and debugging.

You have access to the user's current context:"""
        
        if context.get('current_mits'):
            prompt += f"\n\nCurrent MITs (Most Important Tasks): {[task['title'] for task in context['current_mits']]}"
        
        if context.get('recent_ideas'):
            prompt += f"\n\nRecent Ideas: {[idea['title'] for idea in context['recent_ideas']]}"
        
        if context.get('chaos_level'):
            prompt += f"\n\nCurrent mental state: {context['chaos_level']['level']} - {context['chaos_level']['message']}"
        
        prompt += "\n\nProvide clear, actionable technical guidance. Be concise but thorough."
        
        return prompt

    def _build_chatgpt_system_prompt(self, context: Dict) -> str:
        """Build system prompt for ChatGPT with current context"""
        prompt = """You are the creative AI assistant for Rhythmiq Personal OS. You help with brainstorming, planning, writing, and strategic thinking.

You have access to the user's current context:"""
        
        if context.get('current_mits'):
            prompt += f"\n\nCurrent MITs: {[task['title'] for task in context['current_mits']]}"
        
        if context.get('recent_ideas'):
            prompt += f"\n\nRecent Ideas: {[idea['title'] for idea in context['recent_ideas']]}"
        
        if context.get('chaos_level'):
            prompt += f"\n\nCurrent mental state: {context['chaos_level']['level']} - {context['chaos_level']['message']}"
        
        prompt += "\n\nProvide creative, inspiring, and strategic guidance. Help organize thoughts and suggest next steps."
        
        return prompt

    async def _gather_context(self) -> Dict:
        """Gather relevant context for AI conversations"""
        # Get current MITs
        current_mits = self.db.query(Task).filter(
            Task.user_id == self.user_id,
            Task.is_mit == True,
            Task.status != "done"
        ).limit(3).all()
        
        # Get recent ideas
        recent_ideas = (
            self.db.query(Idea)
            .filter(Idea.user_id == self.user_id)
            .order_by(Idea.created_at.desc())
            .limit(5)
            .all()
        )
        
        # Get chaos level
        from services.chaos_detection import ChaosDetectionService
        chaos_service = ChaosDetectionService(self.db, self.user_id)
        chaos_data = await chaos_service.get_current_chaos_level()
        
        return {
            'current_mits': [{'title': task.title, 'status': task.status} for task in current_mits],
            'recent_ideas': [{'title': idea.title, 'status': idea.status} for idea in recent_ideas],
            'chaos_level': chaos_data
        }

    async def _get_or_create_thread(self, thread_id: Optional[UUID]) -> AIConversation:
        """Get existing thread or create new one"""
        if thread_id:
            conversation = self.db.query(AIConversation).filter(
                AIConversation.id == thread_id,
                AIConversation.user_id == self.user_id
            ).first()
            if conversation:
                return conversation
        
        # Create new conversation
        conversation = AIConversation(
            user_id=self.user_id,
            thread_title="New AI Conversation",
            messages=[],
            ai_participants=[]
        )
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        
        return conversation

    async def _store_conversation(self, conversation: AIConversation, user_message: str, ai_responses: List[Dict]):
        """Store conversation in database"""
        # Add user message
        conversation.messages.append({
            'role': 'user',
            'content': user_message,
            'timestamp': str(asyncio.get_event_loop().time())
        })
        
        # Add AI responses
        for response in ai_responses:
            conversation.messages.append({
                'role': 'assistant',
                'ai': response['ai'],
                'content': response['content'],
                'timestamp': str(asyncio.get_event_loop().time()),
                'model': response.get('model'),
                'tokens_used': response.get('tokens_used')
            })
            
            # Track AI participants
            if response['ai'] not in conversation.ai_participants:
                conversation.ai_participants.append(response['ai'])
        
        # Update conversation
        self.db.commit()