export const useUtils = () => {
  const GBinByte = 1073741824;
  const round = (num: number, decimalPlaces: number = 0) => {
    const p = Math.pow(10, decimalPlaces);
    return Math.round(num * p) / p;
  };
  const formatBytes = (bytes: number, decimals: number = 2) => {
    if (!bytes) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const compareKeyOfArrays = (
    array1: any[],
    array2: any[],
    keyName: string,
  ) => {
    if (!array1 || !array2 || !keyName) return false;
    if (array1.length !== array2.length) return false;

    const keys1 = array1.map((item) => item[keyName]);
    const keys2 = array2.map((item) => item[keyName]);

    for (const key of keys1) {
      if (!keys2.includes(key)) {
        return false;
      }
    }

    return true;
  };

  const setBase64DataFromFile = async (file: File) => {
    // Check if file is provided
    if (!file) return;

    // Convert file to base64
    return await fileToBase64(file);
  };

  const fileToBase64 = async (file: File): Promise<string> => {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result;
        if (
          base64String &&
          ["image/jpeg", "image/jpg", "image/gif", "image/png"].includes(
            file.type,
          )
        )
          resolve(base64String as string);
      };
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  const base64ToFile = async (dataUrl: string, name: string): Promise<File> => {
    return await new Promise((resolve) => {
      const [header, base64] = dataUrl.split(",");
      const mime = header.match(/:(.*?);/)?.[1];
      const bstr = atob(base64);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const extension = mime?.split("/")[1];
      resolve(
        new File(
          [u8arr],
          name +
            "." +
            (extension?.toLowerCase() === "jpeg" ? "jpg" : extension),
          { type: mime },
        ),
      );
    });
  };

  const imageLoadOnError = (e: any, altSrc: string) => {
    e.target.src = altSrc;
  };

  const uuidToColor = (uuid: string | null) => {
    if (!uuid) {
      return "#06d7a0";
    }

    // Remove dashes from the UUID and take the first 6 characters
    const hex = uuid.replace(/-/g, "").slice(0, 6);
    // Ensure the length is 6 characters (UUID is longer, so this ensures safety)
    return `#${hex.padEnd(6, "0")}`;
  };

  const groupBy = (array: any[], key: string) =>
    array.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});

  const differenceInPercentage = (
    oldValue: number,
    newValue: number,
  ): number | string => {
    if (oldValue === 0 && newValue === 0) {
      return 0.0;
    } else if (oldValue === 0) {
      return "infinite";
    }

    const difference = newValue - oldValue;
    return (difference / oldValue) * 100;
  };

  const stripHtmlTags = (content: string | undefined | null) => {
    if (typeof content !== "string") return content || "";
    return content.replace(/<[^>]+>/g, "");
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "m";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const kosovoCities = [
    { code: "pr", name: "Prishtië" },
    { code: "pz", name: "Prizren" },
    { code: "pe", name: "Pejë" },
    { code: "mi", name: "Mitrovicë" },
    { code: "gj", name: "Gjilan" },
    { code: "gjk", name: "Gjakovë" },
    { code: "fe", name: "Ferizaj" },
    { code: "vu", name: "Vushtrri" },
    { code: "po", name: "Podujev" },
    { code: "su", name: "Suharek" },
    { code: "ra", name: "Rahovec" },
    { code: "dr", name: "Drenas" },
    { code: "ma", name: "Malishevë" },
    { code: "ka", name: "Kamenicë" },
    { code: "li", name: "Lipjan" },
    { code: "da", name: "Dragash" },
    { code: "sh", name: "Shtime" },
    { code: "kc", name: "Kaçanik" },
    { code: "ob", name: "Obiliq" },
    { code: "sk", name: "Skenderaj" },
    { code: "fk", name: "Fushë Kosovë" },
    { code: "nb", name: "Novobërd" },
    { code: "he", name: "Hani i Elezit" },
    { code: "zp", name: "Zubin Potok" },
    { code: "le", name: "Leposaviq" },
    { code: "ze", name: "Zveçan" },
  ];

  return {
    GBinByte,
    round,
    formatBytes,
    compareKeyOfArrays,
    setBase64DataFromFile,
    imageLoadOnError,
    groupBy,
    base64ToFile,
    uuidToColor,
    differenceInPercentage,
    stripHtmlTags,
    formatNumber,
    kosovoCities,
  };
};
