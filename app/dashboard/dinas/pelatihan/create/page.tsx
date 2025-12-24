import { createTrainingAction } from '@/actions/dinas'
import TrainingForm from '@/components/admin/TrainingForm'

export default function CreateTrainingPage() {
    return (
        <div className="p-6">
            <TrainingForm actionFn={createTrainingAction} />
        </div>
    )
}
