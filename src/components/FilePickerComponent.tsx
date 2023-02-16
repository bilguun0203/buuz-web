import { useState } from "preact/hooks";
import LoadingStatusComponent from "./LoadingStatusComponent";

interface DetectionResponse {
  count: number;
  boxes: [
    {
      confidence: number;
      box: [number, number, number, number];
    }
  ];
}

export default function FilePickerComponent({ apiUrl }: { apiUrl: string }) {
  const [selectedFile, setSelectedFile] = useState();
  const [requestSent, setRequestSent] = useState(false);
  const [detectionData, setDetectionData] = useState<DetectionResponse | null>(
    null
  );
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onSelectFile = (e: any) => {
    setStatusMessages([]);
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }
    setSelectedFile(e.target.files[0]);
  };

  const onClick = async () => {
    setStatusMessages([]);
    if (!selectedFile) {
      setStatusMessages([...statusMessages, "Зураг сонгоогүй байна."]);
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile, selectedFile.name);
    setRequestSent(true);
    setIsLoading(true);
    await fetch(apiUrl + "/predict", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then(async (data) => {
        setIsLoading(false);
        if ("count" in data) {
          setDetectionData(data);
          return;
        }
        if ("detail" in data) {
          setStatusMessages([...statusMessages, data.detail]);
          setRequestSent(false);
          setSelectedFile(undefined);
        }
      })
      .catch((err) => {
        console.log(err);
        setRequestSent(false);
        setSelectedFile(undefined);
        setStatusMessages([...statusMessages, "Зураг илгээхэд алдаа гарлаа."]);
        setIsLoading(false);
      });
  };

  const onBack = () => {
    setRequestSent(false);
    setSelectedFile(undefined);
    setStatusMessages([]);
  };

  return (
    <div class="text-center">
      {statusMessages.map((message) => (
        <p class="text-red-600 dark:text-red-400 font-medium">
          &gt; {message} &lt;
        </p>
      ))}
      {requestSent && selectedFile ? (
        <div>
          <div class="max-h-96 image-border">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="preview"
              class="object-scale-down max-h-96"
            />
            {detectionData &&
              !isLoading &&
              detectionData.boxes.map((obj) => {
                const x1 = obj.box[0] * 100;
                const y1 = obj.box[1] * 100;
                const x2 = obj.box[2] * 100;
                const y2 = obj.box[3] * 100;
                const width = x2 - x1;
                const height = y2 - y1;
                return (
                  <div
                    class="group border-2 border-rose-600 absolute rounded-md"
                    style={{
                      width: width.toFixed(2) + "%",
                      height: height.toFixed(2) + "%",
                      top: y1.toFixed(2) + "%",
                      left: x1.toFixed(2) + "%",
                    }}
                  >
                    <span class="absolute top-10 scale-0 rounded bg-stone-800 p-2 text-xs text-orange-200 group-hover:scale-100">🤔 {Math.round(obj.confidence * 100)}%</span>
                  </div>
                );
              })}
          </div>

          {isLoading ? (
            <p class="my-4 text-2xl">
              <LoadingStatusComponent /> уншиж байна <LoadingStatusComponent />
            </p>
          ) : detectionData ? (
            <p class="my-4 text-2xl">
              Энд <span class="font-bold underline">{detectionData.count}</span>{" "}
              бууз байна.
            </p>
          ) : (
            <br />
          )}
          <button class="button" type="button" onClick={onBack}>
            Буцах
          </button>
        </div>
      ) : (
        <div>
          <label for="file" class="text-stone-800/90 dark:text-orange-200/80">
            Өрсөн буузныхаа зургийг эгц дээрээс нь аваад "Зураг илгээх" товчийг
            дарна уу.
          </label>
          <input
            class="mt-4 file-input"
            id="file"
            type="file"
            accept="image/png,image/jpeg"
            onChange={onSelectFile}
          />
          <br />
          <button class="button" type="button" onClick={onClick}>
            Зураг илгээх
          </button>
        </div>
      )}
    </div>
  );
}
