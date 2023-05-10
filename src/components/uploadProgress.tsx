import React from "react";

type Props = {
  progress: number;
};

const UploadProgress = ({ progress }: Props) => {
  return (
    <>
      <div className="m-4 flex w-full justify-center">
        <div className="progress_wrapper">
          <p className="font-light">Uploading...</p>
          <div className="flex h-2 w-full rounded bg-gray-200">
            <div
              className="h-full animate-pulse rounded bg-blue-400"
              style={{ width: progress + "%" }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadProgress;
