import LocksmithVerificationForm from '@/components/LocksmithVerificationForm';

export default function VerificationPage() {
    return (
        <div className="container mx-auto max-w-5xl px-4 py-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">🛡️ NASTF Verification</h1>
                <p className="text-sm text-slate-400">
                    Submit your NASTF VSP card or other locksmith proof documents.
                    Verified contributors receive trust badges and higher confidence in community discussions.
                </p>
            </header>
            <LocksmithVerificationForm />
        </div>
    );
}

