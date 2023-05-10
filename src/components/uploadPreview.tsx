import React, { useState } from "react";
import Image from "next/image";
// import { CheckCircleIcon } from "@heroicons/react/solid";
// import { CopyToClipboard } from "react-copy-to-clipboard";

type Props = {
  imageUrl: string;
};

const UploadPreview = ({ imageUrl }: Props) => {
  //   const [copied, setCopied] = useState(false);

  return (
    <>
      <div className="flex w-full justify-center relative">
        <div className="preview_wrapper">
          {/* <CheckCircleIcon className="text-green-200 mx-auto w-12 h-12" /> */}
          {/* <p className="text-center">Upload Successful</p> */}
          <div className="preview_img_box">
            <Image
              alt="uploaded_img"
              src={imageUrl}
              fill={true}
              className="rounded-lg object-cover shadow-lg"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadPreview;
