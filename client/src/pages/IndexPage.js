//indexPage.js
import Post from "../Post";
import {useEffect, useState} from "react";

export default function IndexPage(){
    
    const [posts,setPosts] = useState([]);
    useEffect(() => {
        fetch('http://localhost:4000/post').then(response => {
            response.json().then(posts => {
                setPosts(posts);
            });
        });
    }, []);
    return(
        
        <div className="about-container">
            
        <link href="https://fonts.googleapis.com/css?family=Roboto:100" rel="stylesheet" />
        <div className='light x1'></div>
        <div className='light x2'></div>
        <div className='light x3'></div>
        <div className='light x4'></div>
        <div className='light x5'></div>
        <div className='light x6'></div>
        <div className='light x7'></div>
        <div className='light x8'></div>
        <div className='light x9'></div>
        {posts.length > 0 && posts.map(post => (
            <Post key={post.id} {...post} />
        ))}
      </div>
        
        
        
          
        
        
    );
}