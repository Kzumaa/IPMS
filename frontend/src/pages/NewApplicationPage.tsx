import React from 'react';
import { ApplicationFormWizard } from '../features/application/components';

const NewApplicationPage: React.FC = () => {
    return (
        <div className="flex flex-1 flex-col">
            <main className="flex-1 p-6">
                <ApplicationFormWizard />
            </main>
        </div>
    );
};

export default NewApplicationPage;
