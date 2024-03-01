//header.js
import {Link} from "react-router-dom"
import React, {useEffect, useContext, useState} from "react";
import {UserContext} from "./UserContext";

export default function Header(){
    const {setUserInfo, userInfo} = useContext(UserContext);
    useEffect(() => {
        fetch('https://dynamicconfidence-78bac109c511.herokuapp.com/profile',{
            credentials:'include',
        }).then(response => {
            response.json().then(userInfo => {
                setUserInfo(userInfo);
                console.log(userInfo);
                
            });
        });
    }, [userInfo]);

    function logout(){
        fetch('https://dynamicconfidence-78bac109c511.herokuapp.com/logout', {
            credentials: 'include',
            method:  'POST',
        });
        window.location.reload();
        setUserInfo(null);
    }
    function about(){
        fetch('https://dynamicconfidence-78bac109c511.herokuapp.com/about ', {
            credentials: 'include',
            method:  'POST',
        });
    }



    return(

     
        <header>
            <Link to="/" className="logo">Confidence In Motion  | Home</Link>
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