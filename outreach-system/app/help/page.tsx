import { auth } from "@/auth";
import HelpCenterClient from "./HelpCenterClient";

export default async function HelpCenterPage() {
    const session = await auth();

    return (
        <HelpCenterClient user={session?.user} />
    );
}
