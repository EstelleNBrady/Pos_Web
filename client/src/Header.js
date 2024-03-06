//header.js
import {Link} from "react-router-dom"
import React, {useEffect, useContext, useState} from "react";
import {UserContext} from "./UserContext";

export default function Header(){
    const {setUserInfo, userInfo} = useContext(UserContext);
    useEffect(() => {
        fetch('https://www.dynamiconfidence.com/profile',{
            credentials:'include',
        }).then(response => {
            response.json().then(userInfo => {
                setUserInfo(userInfo);
                console.log(userInfo);
                
            });
        });
    }, [userInfo]);

    function logout(){
        fetch('https://www.dynamiconfidence.com/logout', {
            credentials: 'include',
            method:  'POST',
        });
        window.location.reload();
        setUserInfo(null);
    }
    function about(){
        fetch('https://www.dynamiconfidence.com/about ', {
            credentials: 'include',
            method:  'POST',
        });
    }



    return(

     
        <header>
            <Link to="/" className="logo">Dynamic Confidence  | Home</Link>
            <nav>
                {userInfo && userInfo.username && (
                    <>
                        {userInfo.role === 'admin' && <Link to="/create">Create New Post</Link>}
                        <Link to="/about">About</Link>
                        <a onClick={logout}>Logout</a>
                    </>
                )}
                {!userInfo || !userInfo.username && (
                    <>
                        <Link to="/about">About</Link>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}

            </nav>
        </header>
        
    );
    
}