export const handleImageError = (ev: any) => {
  const img = ev.target;
  img.src = 'https://i.ibb.co/nNsGtRqn/placeholder-80x80.png';
  
  // Style for 40px centered placeholder
  img.style.width = '40px';
  img.style.height = '40px';
  img.style.objectFit = 'contain';
  img.style.position = 'absolute';
  img.style.top = '50%';
  img.style.left = '50%';
  img.style.transform = 'translate(-50%, -50%)';
  
  // Make background transparent so the container's bg-gray-100 shows through
  img.style.backgroundColor = 'transparent';
  img.style.borderRadius = '0';
  img.style.opacity = '0.4';
};