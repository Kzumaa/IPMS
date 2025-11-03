import { useEffect, useState } from "react";

export default function App() {
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ping`)
            .then(r => r.json()).then(setData).catch(console.error);
    }, []);
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
