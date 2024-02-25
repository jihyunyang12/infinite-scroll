import { useEffect, useState, useCallback, useRef } from "react";
import { parseLinkHeader } from "./parseLinkHeader.js";
import "./styles.css";

function App() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const nextUrl = useRef();

  const imgRef = useCallback((input) => {
    if (input == null) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchPhotos(nextUrl.current);
        observer.unobserve(input);
      }
    });
    observer.observe(input);
  }, []);

  async function fetchPhotos(url, overwrite = false) {
    setIsLoading(true);
    const res = await fetch(url);
    nextUrl.current = parseLinkHeader(res.headers.get("Link")).next;
    const data = await res.json();

    if (overwrite) {
      setPhotos(data);
    } else {
      setPhotos((prevPhotos) => {
        return [...prevPhotos, ...data];
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchPhotos("http://localhost:3000/photos?_page=1&_limit=20", true);
  }, []);

  return (
    <div className="grid">
      {photos.map((photo, idx) => (
        <img
          key={photo.id}
          src={photo.url}
          ref={idx === photos.length - 1 ? imgRef : undefined}
        />
      ))}
      {isLoading &&
        Array.from(Array(20)).map((_, idx) => (
          <div key={idx} className="skeleton">
            Loading...
          </div>
        ))}
    </div>
  );
}

export default App;
