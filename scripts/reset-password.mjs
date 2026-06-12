import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dtbouycelkjgyddpftir.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg'
)

const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
if (listError) { console.error(listError); process.exit(1) }

const user = users.find(u => u.email === 'test@resumenes.com')
if (!user) { console.error('Usuario no encontrado'); process.exit(1) }

const { error } = await supabase.auth.admin.updateUserById(user.id, { password: 'Test1234!' })
if (error) { console.error(error); process.exit(1) }

console.log('Contraseña actualizada correctamente para', user.email)
