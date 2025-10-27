import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test connection by listing tables
async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('products').select('count');
    
    if (error) {
      console.log('❌ Connection test result:', error.message);
      console.log('Note: This might mean the table doesn\'t exist yet, but connection is working');
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

testConnection();
