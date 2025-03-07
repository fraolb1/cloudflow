import { Button } from "./ui/button";

function Bucket_files_deleter() {
  const handleClick = async () => {
    const result = await fetch("api/files", {
      method: "DELETE",
    });
    console.log(result);
  };
  return <Button onClick={handleClick}>Delete Bucket File</Button>;
}

export default Bucket_files_deleter;
