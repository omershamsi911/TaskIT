import os
# import openai # Uncomment when you install the openai package

class AIService:
    @staticmethod
    async def analyze_review(comment: str) -> bool:
        """
        Analyzes the review text using AI.
        Returns True if the review is legitimate and safe.
        Returns False if it contains spam, extreme toxicity, or nonsense.
        """
        if not comment or len(comment.strip()) < 3:
            return True

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            # Fallback for MVP if no API key is present
            toxic_words = ["spam", "fake", "scam", "fuck", "shit", "bitch"]
            return not any(word in comment.lower() for word in toxic_words)

        # Actual OpenAI Implementation
        try:
            # openai.api_key = api_key
            # response = await openai.ChatCompletion.acreate(
            #     model="gpt-3.5-turbo",
            #     messages=[
            #         {"role": "system", "content": "You are a moderation AI. Reply ONLY with 'SAFE' or 'SPAM' based on the user's review of a domestic service provider."},
            #         {"role": "user", "content": comment}
            #     ],
            #     max_tokens=5,
            #     temperature=0.0
            # )
            # result = response.choices[0].message.content.strip().upper()
            # return result == "SAFE"
            
            return True # Remove this when uncommenting above
        except Exception as e:
            print(f"AI Error: {e}")
            return True # Default to verified if AI fails