import React, { useEffect, useMemo } from 'react';
import { useDropzone, DropzoneRootProps } from 'react-dropzone';
import { isEmpty } from 'lodash';
import { saveAs } from 'file-saver';
import { readJSONLog } from '../../helper';
import { TraceEvent } from '../../types';
import { Mock } from '../../mock';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

const activeStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};

function saveFile() {
  const filename = 'events.json';
  const example: TraceEvent[] = new Mock().mock();

  const blob = new Blob([JSON.stringify(example)], {
    type: 'application/json',
  });
  saveAs(blob, filename);
}

export function JSONLogReader({
  onLoad,
}: {
  onLoad: (events: TraceEvent[]) => void;
}) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
  } = useDropzone({ accept: '.json', multiple: false });

  useEffect(() => {
    if (!isEmpty(acceptedFiles) && onLoad) {
      readJSONLog(acceptedFiles[0]).then(onLoad);
    }
  }, [acceptedFiles]);

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragAccept, isDragActive, isDragReject],
  );

  return (
    <div className="container">
      <div {...getRootProps({ style } as DropzoneRootProps)}>
        <input {...getInputProps()} />
        <p>
          Drag a parsed <strong>events.json</strong> here, or click to select
          file
        </p>
      </div>
      <div>
        Or try this mock&nbsp;
        <a onClick={() => saveFile()}>events.json</a>
      </div>
    </div>
  );
}
