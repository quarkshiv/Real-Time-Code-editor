import { supabase } from "./lib/supabaseClient";

// Get all rows
export async function getData() {
  const { data, error } = await supabase.from("test_table").select("*");
  if (error) throw error;
  return data;
}

// Insert a new row
export async function addData(name) {
  const { data, error } = await supabase.from("test_table").insert([{ name }]);
  if (error) throw error;
  return data;
}
