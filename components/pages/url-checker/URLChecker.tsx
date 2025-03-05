import URLStatus from "@/components/pages/url-checker/URLStatus.tsx";
import {useParams} from "react-router";

function URLChecker() {
    const { url } = useParams();

    return (
        <>
            <URLStatus inputURL={url ?? ''} />
        </>
    );
}

export default URLChecker;