import { NextPage } from "next";
import dynamic from "next/dynamic";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

const DocsPage: NextPage = () => {
    return (
        <div style={{ height: "100vh" }}>
            <SwaggerUI url="/api/swagger" />
        </div>
    );
};

export default DocsPage;
