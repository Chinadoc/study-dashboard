import DossierLibraryClient from './DossierLibraryClient';

export const metadata = {
    title: 'Dossier Library | EuroKeys',
    description: 'Browse 230 technical locksmith dossiers organized by make, with search and filtering.',
};

export default function DossiersPage() {
    return <DossierLibraryClient />;
}
