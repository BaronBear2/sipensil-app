import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

export const SwalToast = MySwal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer
        toast.onmouseleave = Swal.resumeTimer
    }
})

export const SwalConfirm = MySwal.mixin({
    title: 'Apakah Anda yakin?',
    text: "Tindakan ini tidak dapat dibatalkan!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Lanjutkan!',
    cancelButtonText: 'Batal',
    customClass: {
        popup: 'rounded-xl shadow-xl border border-gray-100',
        confirmButton: 'bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        cancelButton: 'bg-white text-gray-700 font-bold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ml-2'
    },
    buttonsStyling: false
})

export const SwalAlert = MySwal.mixin({
    customClass: {
        popup: 'rounded-xl shadow-xl border border-gray-100',
        confirmButton: 'bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700'
    },
    buttonsStyling: false
})
