import MasterDataManager from "./MasterDataManager";
import { getMasterData } from "./actions";

export default async function DataPage() {
    const data = await getMasterData();
    // Rehydrate as plain object because of Next.js hydration of Mongoose docs
    const plainData = JSON.parse(JSON.stringify(data));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-brand-dark">Master Data Management</h1>
            <p className="text-slate-600">
                Manage dynamic dropdown lists for things like Drug Types, Disease Diagnoses, and Outreach Locations.
                Changes here reflect immediately across the data collection forms.
            </p>

            <MasterDataManager initialData={plainData} />
        </div>
    );
}
