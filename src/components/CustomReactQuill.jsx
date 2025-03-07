// components/CustomReactQuill.js
"use client";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
    ssr: false,
    loading: () => <p>Loading editor...</p>,
});

const CustomReactQuill = (props) => {
    return <ReactQuill {...props} />;
};

export default CustomReactQuill;