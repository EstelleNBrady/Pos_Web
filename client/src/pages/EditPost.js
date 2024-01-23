import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../Editor"
export default function EditPost(){
    const {id} = useParams();
    const [title,setTitle] = useState('');
    const [summary,setSummary] = useState('');
    const [content,setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect,setRedirect] = useState('');

    useEffect(() => {
        fetch('http://localhost:4000/post/'+id)
        .then(response => {
            response.json().then(postInfo => {
                setTitle(postInfo.title);
                setContent(postInfo.content);
                setSummary(postInfo.summary);

            });
        });
    }, []);

    function updatePost(ev){
        ev.preventDefault();
        const data = new FormData();
        fetch('http://localhost:4000/post', {
            method: 'PUT',

        })
    }
    if (redirect){
        return <Navigate to={'/'} />

    }


    
    return(
        <form onSubmit={updatePost}>
            <input type="title"
                placeholder={'Title'} 
                value={title} 
                onChange={ev => setTitle(ev.target.value)}/>
            <input type="summary" 
                placeholder={'Summary'}
                value={summary}
                onChange={ev => setSummary(ev.target.value)}/>

            <input type="file"
                onChange={ev => setFiles(ev.target.files)}/>
            <Editor onChange={setContent} value={content}/>
            <button style={{marginTop:'5px'}}>Update post</button>
        </form>
        
    );
}

