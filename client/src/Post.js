import {format} from "date-fns";
export default function Post({title,summary,cover,content, createdAt, author}){
    return(        
    <div className="post">
    <div className="image">
      <img src="https://www.trendeing.com/wp-content/uploads/2019/04/iStock-1124754300.jpg" alt="" />
    </div>
    <div className="texts">
      <h2>{title}</h2>
      <p className="info">
      <a className="author">{author ? author.username : 'Unknown author'}</a>
        <time>{format(new Date (createdAt), 'MMM d, yyyy HH:mm')}</time>
      </p>
      <p className="summary">{summary}</p>
    </div>
  </div>
);

}