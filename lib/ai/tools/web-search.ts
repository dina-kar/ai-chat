import { tool } from 'ai';
import { z } from 'zod';

export const webSearch = tool({
  description: 'Search the web for current information on any topic',
  parameters: z.object({
    query: z.string().describe('The search query to find information about'),
  }),
  execute: async ({ query }) => {
    try {
      // Using DuckDuckGo Instant Answer API for web search
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(
          query
        )}&format=json&no_html=1&skip_disambig=1`
      );

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data = await response.json();

      // Format the search results
      const results = {
        query: query,
        abstract: data.Abstract || '',
        abstractSource: data.AbstractSource || '',
        abstractURL: data.AbstractURL || '',
        answer: data.Answer || '',
        answerType: data.AnswerType || '',
        definition: data.Definition || '',
        definitionSource: data.DefinitionSource || '',
        definitionURL: data.DefinitionURL || '',
        heading: data.Heading || '',
        image: data.Image || '',
        infobox: data.Infobox || null,
        redirect: data.Redirect || '',
        relatedTopics: data.RelatedTopics?.slice(0, 5) || [],
        results: data.Results?.slice(0, 5) || [],
        type: data.Type || '',
      };

      // If no useful results, try alternative search approach
      if (!results.abstract && !results.answer && !results.definition && results.results.length === 0) {
        // Fallback: Return a structured response indicating we need better search capabilities
        return {
          query: query,
          message: `I searched for "${query}" but couldn't find specific results. Here are some alternatives:`,
          suggestions: [
            'Try rephrasing your search query',
            'Be more specific about what you\'re looking for',
            'Ask me about topics I can help with like weather, coding, writing, or general knowledge'
          ]
        };
      }

      return results;
    } catch (error) {
      console.error('Web search error:', error);
      return {
        query: query,
        error: 'Search temporarily unavailable',
        message: `I couldn't search for "${query}" right now. I can still help with other topics like weather, coding, writing, or general knowledge.`
      };
    }
  },
}); 