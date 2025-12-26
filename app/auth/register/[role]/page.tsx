import StatusModal from '@/components/ui/StatusModal'

export default function RegisterForm({ params }: { params: Promise<{ role: string }> }) {
  const resolvedParams = use(params)
  const role = resolvedParams.role

  const router = useRouter()
  // const supabase = createClient() // Not needed for Server Action auth
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Modal State
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean
    type: 'success' | 'error'
    message: string
    onClose?: () => void
  }>({
    isOpen: false,
    type: 'success',
    message: ''
  })

  // State yang disederhanakan untuk Register
  const [formData, setFormData] = useState({
    name: '',
    nik: '', // Khusus Pencaker
    email: '',
    password: '',
    confirmPassword: '', // Verifikasi Password
    // Field LPK/Perusahaan tetap ada di register (sesuai best practice business)
    vin: '',
    nib: '',
    phone: '', // Untuk Admin LPK/Perusahaan (contact person)
    // Field LPK Baru
    operational_pj: '',
    operational_pj_title: '',
    operational_pj_phone: '',
    operational_pj_email: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. Validasi Password
    if (formData.password !== formData.confirmPassword) {
      setStatusModal({ isOpen: true, type: 'error', message: "Password dan Konfirmasi Password tidak sama!" })
      setLoading(false)
      return
    }

    // 2. Client-Side Validation (Strict V5.1)
    if (role === 'pencaker') {
      const nik = formData.nik
      if (nik.length !== 16) {
        setStatusModal({ isOpen: true, type: 'error', message: "NIK Harus 16 digit!" })
        setLoading(false)
        return
      }
      if (!nik.startsWith('3216')) {
        setStatusModal({ isOpen: true, type: 'error', message: "Maaf, pendaftaran khusus warga Kabupaten Bekasi (NIK berawalan 3216)." })
        setLoading(false)
        return
      }
    }

    // Strict Password Validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&-_])[A-Za-z\d@$!%*#?&-_]{6,}$/
    if (!passwordRegex.test(formData.password)) {
      setStatusModal({ isOpen: true, type: 'error', message: "Password Tidak Valid! Harus minimal 6 karakter, mengandung Huruf, Angka, dan Simbol (@$!%*#?&-_)." })
      setLoading(false)
      return
    }

    if (role === 'lpk' && formData.operational_pj_phone.length < 10) {
      setStatusModal({ isOpen: true, type: 'error', message: "Nomor HP Penanggungjawab minimal 10 digit!" })
      setLoading(false)
      return
    }
    if (role === 'perusahaan' && formData.phone.length < 10) {
      setStatusModal({ isOpen: true, type: 'error', message: "Nomor Telepon HRD minimal 10 digit!" })
      setLoading(false)
      return
    }

    // 3. Prep FormData for Server Action
    const fd = new FormData()
    // Base Auth
    fd.append('email', formData.email)
    fd.append('password', formData.password)

    // Metadata Fields
    const dbRole = role === 'lpk' ? 'ADMIN_LPK' : role === 'perusahaan' ? 'ADMIN_PERUSAHAAN' : 'PENCAKER'
    fd.append('role', dbRole)
    fd.append('fullName', formData.name) // Official field
    fd.append('name', formData.name) // Fallback for action

    // Extended Fields
    if (formData.nik) fd.append('nik', formData.nik)
    if (formData.phone) fd.append('phone', formData.phone)
    if (formData.nib) fd.append('nib', formData.nib)

    // LPK Specific
    if (formData.operational_pj) fd.append('operational_pj', formData.operational_pj)
    if (formData.operational_pj_title) fd.append('operational_pj_title', formData.operational_pj_title)
    if (formData.operational_pj_phone) fd.append('operational_pj_phone', formData.operational_pj_phone)
    if (formData.operational_pj_email) fd.append('operational_pj_email', formData.operational_pj_email)

    // 3. Call Server Action
    import('@/actions/auth').then(async (mod) => {
      const result = await mod.signup(fd)
      if (result?.error) {
        setStatusModal({ isOpen: true, type: 'error', message: "Gagal Registrasi: " + result.error })
        setLoading(false)
      } else {
        setStatusModal({
          isOpen: true,
          type: 'success',
          message: 'Registrasi Berhasil! Silakan cek email Anda untuk verifikasi.',
          onClose: () => router.push('/auth/login')
        })
        // Auto redirect fallback
        setTimeout(() => router.push('/auth/login'), 2000)
      }
    })
  }

  // --- RENDER FORM ---
  const renderFormContent = () => {
    if (role === 'pencaker') {
      return (
        <div className="space-y-4">
          {/* HANYA 5 FIELD UTAMA SESUAI REQUEST */}
          <div>
            <label className="text-xs font-bold block mb-1">NIK (16 Digit - Khusus Kab. Bekasi)</label>
            <input required name="nik" type="number" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="3216xxxxxxxxxxxx" />
            <p className="text-[10px] text-gray-400 mt-1">*Harus berawalan 3216</p>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Nama Lengkap (Sesuai KTP)</label>
            <input required name="name" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama Lengkap" />
          </div>
        </div>
      )
    }
    else if (role === 'lpk') {
      return (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold block mb-1">Nama LPK</label>
            <input required name="name" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: LPK Maju Jaya" />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Penanggung Jawab</label>
            <input required name="operational_pj" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama Lengkap Penanggung Jawab" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1">Jabatan Penanggung Jawab</label>
              <input required name="operational_pj_title" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Manager" />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">No. Kontak/HP Penanggung Jawab</label>
              <input required name="operational_pj_phone" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="08xxxxxxxxxx" />
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-xs font-bold block mb-1">Nama Perusahaan</label><input required name="name" onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
          <div><label className="text-xs font-bold block mb-1">NIB</label><input required name="nib" onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
          <div className="md:col-span-2"><label className="text-xs font-bold block mb-1">No. Telepon HRD</label><input required name="phone" onChange={handleChange} className="w-full border rounded p-2 text-sm" /></div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center font-sans">
      <StatusModal
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        message={statusModal.message}
        onClose={() => {
          setStatusModal(prev => ({ ...prev, isOpen: false }))
          if (statusModal.onClose) statusModal.onClose()
        }}
      />

      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
        <Link href="/auth/register" className="text-gray-500 mb-6 flex items-center gap-2 font-bold hover:text-blue-600 transition-colors">
          <ArrowLeft size={16} /> Kembali
        </Link>

        <div className="flex flex-col items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 capitalize">
            Pendaftaran {role === 'lpk' ? 'LPK' : role === 'perusahaan' ? 'Perusahaan' : 'Pencari Kerja'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Buat akun baru untuk mengakses layanan.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            {renderFormContent()}
          </div>

          {/* Email & Password (Termasuk Verifikasi Password) */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-700"><Lock size={16} /> Akun Login</h4>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Email</label>
                <input required name="email" type="email" onChange={handleChange} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="nama@email.com" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Password</label>
                  <div className="relative">
                    <input required name="password" type={showPassword ? "text" : "password"} onChange={handleChange} className="w-full border rounded p-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="******" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Ulangi Password</label>
                  <div className="relative">
                    <input required name="confirmPassword" type={showConfirmPassword ? "text" : "password"} onChange={handleChange} className="w-full border rounded p-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="******" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-4 hover:bg-blue-700 transition-colors shadow-md disabled:bg-blue-300">
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>
      </div>
    </div>
  )
}
