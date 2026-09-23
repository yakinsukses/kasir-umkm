// ISI 2 BARIS INI DENGAN DATA PROJECT SUPABASE KAMU
// Ambil dari: Supabase Dashboard -> Project Settings -> API
const SUPABASE_URL = "https://ublosxdglmmeenbofpdx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibG9zeGRnbG1tZWVuYm9mcGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNjkyOTIsImV4cCI6MjEwNTc0NTI5Mn0.OBiVO0w6M2UBRHYwBy2Fr10F-yWZ_eGTXh4IZlAG6Do";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
