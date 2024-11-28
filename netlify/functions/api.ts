import { Handler } from '@netlify/functions';
import { supabase, corsHeaders } from './config';

export const handler: Handler = async (event, context) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders
    };
  }

  try {
    // Extract auth token from headers
    const token = event.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    // Route handling based on path and method
    const path = event.path.replace('/api/', '');
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : null;

    let result;

    switch (`${method} ${path}`) {
      case 'GET /courses':
        result = await supabase.from('courses').select('*');
        break;
      
      case 'POST /courses':
        result = await supabase.from('courses').insert(body);
        break;
      
      default:
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Not found' })
        };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.data)
    };

  } catch (error: any) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};