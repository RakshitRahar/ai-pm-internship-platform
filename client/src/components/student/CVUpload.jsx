import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    CloudArrowUpIcon, DocumentIcon, CheckCircleIcon,
    ExclamationCircleIcon, ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { userAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const STATUS = { IDLE: 'idle', UPLOADING: 'uploading', SUCCESS: 'success', ERROR: 'error' };

export default function CVUpload({ onSuccess }) {
    const [status, setStatus] = useState(STATUS.IDLE);
    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const { updateUser } = useAuthStore();

    const onDrop = useCallback(async (acceptedFiles) => {
        const uploadedFile = acceptedFiles[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        setStatus(STATUS.UPLOADING);
        setProgress(10);

        const formData = new FormData();
        formData.append('cv', uploadedFile);

        try {
            // Simulate progressive upload feedback
            const progressInterval = setInterval(() => {
                setProgress((p) => Math.min(p + 5, 85));
            }, 800);

            const { data } = await userAPI.uploadCV(formData);

            clearInterval(progressInterval);
            setProgress(100);
            setStatus(STATUS.SUCCESS);
            setResult(data.aiAnalysis);

            if (data.user) updateUser({ cv: data.user.cv, skills: data.user.skills });

            toast.success('CV uploaded and analyzed successfully! 🎉');
            if (onSuccess) onSuccess(data);
        } catch (error) {
            setStatus(STATUS.ERROR);
            setProgress(0);
            const msg = error.response?.data?.message || 'Upload failed. Please try again.';
            toast.error(msg);
        }
    }, [onSuccess, updateUser]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
        disabled: status === STATUS.UPLOADING,
    });

    const reset = () => {
        setStatus(STATUS.IDLE);
        setFile(null);
        setProgress(0);
        setResult(null);
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                {...getRootProps()}
                className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-300
          ${isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-surface-600 hover:border-primary-500/50 hover:bg-surface-700/30'}
          ${status === STATUS.UPLOADING ? 'pointer-events-none opacity-75' : ''}
        `}
            >
                <input {...getInputProps()} />

                {status === STATUS.IDLE && (
                    <div className="space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto">
                            <CloudArrowUpIcon className="w-7 h-7 text-primary-400" />
                        </div>
                        <div>
                            <p className="font-medium text-white">
                                {isDragActive ? 'Drop your CV here' : 'Drag & drop your CV here'}
                            </p>
                            <p className="text-slate-400 text-sm mt-1">or click to browse files</p>
                        </div>
                        <p className="text-xs text-slate-500">PDF or DOCX • Max 10MB</p>
                    </div>
                )}

                {status === STATUS.UPLOADING && (
                    <div className="space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto">
                            <ArrowPathIcon className="w-7 h-7 text-primary-400 animate-spin" />
                        </div>
                        <div>
                            <p className="font-medium text-white">Uploading & analyzing...</p>
                            <p className="text-slate-400 text-sm mt-1">AI is parsing your CV</p>
                        </div>
                        <div className="relative w-full bg-surface-700 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500">{progress}% complete</p>
                    </div>
                )}

                {status === STATUS.SUCCESS && (
                    <div className="space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                            <CheckCircleIcon className="w-7 h-7 text-emerald-400" />
                        </div>
                        <div>
                            <p className="font-medium text-emerald-400">Analysis complete!</p>
                            <p className="text-slate-400 text-sm mt-1">{file?.name}</p>
                        </div>
                    </div>
                )}

                {status === STATUS.ERROR && (
                    <div className="space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                            <ExclamationCircleIcon className="w-7 h-7 text-red-400" />
                        </div>
                        <p className="font-medium text-red-400">Upload failed</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            {(status === STATUS.SUCCESS || status === STATUS.ERROR) && (
                <button onClick={reset} className="btn btn-ghost w-full">
                    Upload another CV
                </button>
            )}

            {/* Analysis Quick Summary */}
            {status === STATUS.SUCCESS && result && (
                <div className="card p-4 space-y-3 animate-slide-up">
                    <h4 className="font-medium text-white text-sm flex items-center gap-2">
                        <span>🤖</span> AI Analysis Summary
                    </h4>
                    {result.cvQualityScore && (
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">CV Quality Score</span>
                            <span className={`font-bold text-sm ${result.cvQualityScore >= 70 ? 'text-emerald-400' : result.cvQualityScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                {result.cvQualityScore}/100
                            </span>
                        </div>
                    )}
                    {result.extractedData?.technicalSkills?.length > 0 && (
                        <div>
                            <p className="text-slate-400 text-xs mb-2">Detected Skills</p>
                            <div className="flex flex-wrap gap-1">
                                {result.extractedData.technicalSkills.slice(0, 8).map((skill) => (
                                    <span key={skill} className="badge badge-blue text-xs">{skill}</span>
                                ))}
                                {result.extractedData.technicalSkills.length > 8 && (
                                    <span className="badge badge-gray text-xs">+{result.extractedData.technicalSkills.length - 8} more</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
