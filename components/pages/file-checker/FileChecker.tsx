import FileStatus from "@/components/pages/file-checker/FileStatus.tsx";
import {useParams} from "react-router";

function FileChecker() {
    const { file } = useParams();

    return (
        <>
            <FileStatus inputFile={file ?? ''} />
        </>
    );
}

export default FileChecker;