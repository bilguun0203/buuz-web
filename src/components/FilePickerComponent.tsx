import { useState } from "preact/hooks";
import LoadingStatusComponent from "./LoadingStatusComponent";

export default function FilePickerComponent({apiUrl} : {apiUrl: string}) {
  const [selectedFile, setSelectedFile] = useState();
  const [requestSent, setRequestSent] = useState(false);
  const [detectionData, setDetectionData] = useState();
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
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="preview"
            class="mx-auto h-96 object-scale-down image-border"
          />
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
