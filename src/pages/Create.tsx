import React,{useState,ChangeEvent, use} from "react";
const ImageUpload:React.FC = () =>{
const[image,setImage]= useState<File|null>(null);
const[preview,setPreview]=useState<string|null>(null);

const handleImageChange = (e:ChangeEvent<HTMLInputElement>)=>{

const file = e.target.files?.[0];
if (file){
    setImage(file);
    setPreview(URL.createObjectURL(file));
}

};
const handleUpload = ()=>{
    if(!image){
        alert("select an image");
        return;
    }
const formData = new FormData();
formData.append("image", image);
fetch("http://localhost:5000/upload",{
    method:"POST",
    body:formData
})
.then(res => res.json())
.then(data => console.log(data))
.then(err => console.log(err));

};
return(
    <div style={{padding:"20px"}}>
        <h2>upload Image</h2>
        <input type = "file" accept = "image/*" onChange={handleImageChange}/>
        <br></br>
        {
            preview && (
                <img src= {preview}
                alt= "preview" width="200"/>
            )
        }
        <br></br>
        <button onClick= {handleUpload}>upload image</button>


    </div>
);

};
export default ImageUpload;
