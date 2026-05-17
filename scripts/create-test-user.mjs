import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = 'https://dtbouycelkjgyddpftir.supabase.co'
const SERVICE_ROLE_KEY = 'sb_secret_ZJyjAMN9uAI5hmNYHnrxrQ_NOxfuegM'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const TEST_EMAIL    = 'test@resumenes.com'
const TEST_PASSWORD = 'Test1234!'
const TEST_NAME     = 'Estudiante Prueba'

async function main() {
  console.log('Creando usuario de prueba...')

  // 1. Crear usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email:             TEST_EMAIL,
    password:          TEST_PASSWORD,
    email_confirm:     true,
    user_metadata:     { full_name: TEST_NAME },
  })

  if (authError) {
    console.error('Error creando usuario:', authError.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log('✅ Usuario creado:', userId)

  // 2. Actualizar perfil (must_change_pass = false para saltar el cambio de contraseña)
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: TEST_NAME, must_change_pass: false })
    .eq('id', userId)

  if (profileError) {
    console.error('Error actualizando perfil:', profileError.message)
  } else {
    console.log('✅ Perfil actualizado')
  }

  // 3. Darle acceso a Lógica Matemática y Seminario de prueba
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name, slug')
    .in('slug', ['logica-matematica', 'seminario'])

  if (subjects && subjects.length > 0) {
    const userSubjects = subjects.map(s => ({
      user_id:    userId,
      subject_id: s.id,
      granted_by: 'test-script',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    }))

    const { error: subjectError } = await supabase
      .from('user_subjects')
      .insert(userSubjects)

    if (subjectError) {
      console.error('Error asignando materias:', subjectError.message)
    } else {
      console.log('✅ Materias asignadas:', subjects.map(s => s.name).join(', '))
    }
  }

  console.log('\n─────────────────────────────────')
  console.log('USUARIO DE PRUEBA LISTO')
  console.log('─────────────────────────────────')
  console.log('Email:      ', TEST_EMAIL)
  console.log('Contraseña: ', TEST_PASSWORD)
  console.log('Materias:   Lógica Matemática, Seminario')
  console.log('─────────────────────────────────')
}

main()
