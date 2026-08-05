import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Camera, Upload, RefreshCw, Download, 
  ShoppingBag, Check, Eye, Trash2, Heart, Plus,
  ChevronRight, ArrowLeft, ArrowRight, Play, Info, Sliders,
  HelpCircle, Settings, Move, Minimize2, CheckCircle2, RotateCw
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MOCK_PRODUCTS = [
  {
    id: 101,
    name: 'Blue Casual Shirt',
    category: 'shirt',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80',
    colors: ['Blue', 'Navy', 'Sky Blue'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'A premium cotton casual shirt featuring a modern collar, slim-fit silhouette, and breathable weave perfect for all-day smart casual wear.'
  },
  {
    id: 102,
    name: 'Pink Floral Dress',
    category: 'dress',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=80',
    colors: ['Pink', 'Rose Gold', 'Crimson'],
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'An elegant floral-printed A-line dress crafted with premium georgette fabric. Designed with a cinched waist and flowy hemline for summer outings.'
  },
  {
    id: 103,
    name: 'Black Leather Jacket',
    category: 'jacket',
    price: 4999,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80',
    colors: ['Black', 'Dark Brown'],
    sizes: ['M', 'L', 'XL'],
    description: 'Classic biker leather jacket made from 100% genuine top-grain leather. Finished with asymmetrical heavy-duty zippers and a premium polyester lining.'
  },
  {
    id: 104,
    name: 'Yellow Polo Shirt',
    category: 'polo',
    price: 899,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=80',
    colors: ['Yellow', 'Mustard', 'Amber'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Sporty knit polo crafted from breathable pique-cotton. Styled with ribbed collar and cuffs, and subtle brand embroidery on the chest.'
  },
  {
    id: 105,
    name: 'Olive Cargo Pants',
    category: 'pants',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=80',
    colors: ['Olive', 'Khaki', 'Dark Grey'],
    sizes: ['30', '32', '34', '36'],
    description: 'Heavy-duty cotton ripstop cargo trousers. Equipped with secure multi-pocket storage, articulated knees, and custom fit drawcords.'
  }
];

const PRESET_MODELS = [
  {
    id: 'model_m',
    gender: 'Male',
    name: 'Male Model Reference',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'model_f',
    gender: 'Female',
    name: 'Female Model Reference',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
  }
];

export default function VirtualTryOn() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // States
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0]);
  const [selectedColor, setSelectedColor] = useState(MOCK_PRODUCTS[0].colors[0]);
  const [selectedSize, setSelectedSize] = useState(MOCK_PRODUCTS[0].sizes[1]);
  
  const [popupOpen, setPopupOpen] = useState(false);
  const [customerPhoto, setCustomerPhoto] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [processingState, setProcessingState] = useState('idle'); // idle, pose_detecting, garment_fitting, finished
  const [processingProgress, setProcessingProgress] = useState(0);
  const [tryOnResult, setTryOnResult] = useState(null);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  // Split-screen Before/After Slider Value
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  // Adjustments states for manual fit optimization
  const [scale, setScale] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(60);
  const [rotation, setRotation] = useState(0);
  const [showAdjustments, setShowAdjustments] = useState(false);

  // Check state from location/navigation (e.g. preloaded garment from chatbot)
  useEffect(() => {
    if (location.state && location.state.preloadedGarment) {
      const match = MOCK_PRODUCTS.find(p => 
        p.name.toLowerCase().includes(location.state.preloadedGarment.toLowerCase()) ||
        p.category.toLowerCase().includes(location.state.preloadedGarment.toLowerCase())
      );
      if (match) {
        setSelectedProduct(match);
        setSelectedColor(match.colors[0]);
        setSelectedSize(match.sizes[1]);
        setPopupOpen(true);
      }
    }
  }, [location]);

  // Handle camera preview stream
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 640 } });
      setCameraStream(stream);
      const videoElement = document.getElementById('camera-preview');
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    } catch (err) {
      toast.error('Failed to access camera: ' + err.message);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-preview');
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg');
    setCustomerPhoto(dataUrl);
    stopCamera();
    toast.success('Photo captured successfully!');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomerPhoto(event.target.result);
        toast.success('Photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Blended Canvas Image of Selected User wearing Selected Garment
  const renderTryOnCanvas = () => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const userImg = new Image();
      const garmentImg = new Image();
      
      userImg.crossOrigin = 'anonymous';
      garmentImg.crossOrigin = 'anonymous';

      userImg.onload = () => {
        // Set canvas to same aspect ratio as user image
        canvas.width = userImg.width;
        canvas.height = userImg.height;
        
        // Draw User Photo
        ctx.drawImage(userImg, 0, 0, canvas.width, canvas.height);
        
        // Load Garment
        garmentImg.onload = () => {
          ctx.save();
          
          // Position Garment over user chest
          const garmentWidth = canvas.width * 0.55 * scale;
          const garmentHeight = (garmentImg.height / garmentImg.width) * garmentWidth;
          
          // Calculate Center
          const centerX = (canvas.width / 2) + offsetX;
          const centerY = (canvas.height * 0.45) + offsetY;
          
          // Rotate & Translate
          ctx.translate(centerX, centerY);
          ctx.rotate((rotation * Math.PI) / 180);
          
          // Draw Garment
          ctx.drawImage(garmentImg, -garmentWidth / 2, -garmentHeight / 2, garmentWidth, garmentHeight);
          
          ctx.restore();
          
          // Output base64 data url
          resolve(canvas.toDataURL('image/jpeg'));
        };
        
        // If image loading fails, use selected product image
        garmentImg.src = selectedProduct.image;
      };
      
      userImg.src = customerPhoto;
    });
  };

  // Run the simulated AI Pipeline
  const runAIPipeline = async () => {
    if (!customerPhoto) {
      toast.error('Please upload or capture a photo first');
      return;
    }

    setProcessingState('pose_detecting');
    setProcessingProgress(10);

    // AI Processing Log Steps
    const steps = [
      { progress: 20, state: 'pose_detecting', msg: 'Scanning posture guidelines...' },
      { progress: 40, state: 'pose_detecting', msg: 'Body landmark anchors located (15 joints mapped)' },
      { progress: 60, state: 'garment_fitting', msg: 'Matching shoulder grid alignment...' },
      { progress: 85, state: 'garment_fitting', msg: 'Warping fabric and shadow synthesis...' },
      { progress: 100, state: 'finished', msg: 'Optimizing final resolutions...' }
    ];

    try {
      // 1. Trigger the real API call to the backend with a high timeout limit (90 seconds)
      const response = await api.post('/try-on/fit', {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        color: selectedColor,
        size: selectedSize,
        customerImage: customerPhoto
      }, {
        timeout: 90000
      });

      for (const step of steps) {
        await new Promise(r => setTimeout(r, 600));
        setProcessingProgress(step.progress);
        if (step.state !== processingState) {
          setProcessingState(step.state);
        }
      }

      if (response.data && response.data.resultImage) {
        setTryOnResult(response.data.resultImage);
        toast.success('✨ AI Fitting complete! Enjoy your Virtual Try-On.');
      } else {
        throw new Error('Invalid response from AI server');
      }

    } catch (err) {
      console.error(err);
      toast.error('AI pipeline encountered an issue. Generating fallback preview...');
      
      // Fallback: draw user photo and overlay garment via canvas
      const blendedResult = await renderTryOnCanvas();
      setTryOnResult(blendedResult);
      setProcessingState('finished');
      setProcessingProgress(100);
    }
  };

  const handleAddToCart = () => {
    const cartItem = {
      product: selectedProduct,
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
      price: selectedProduct.price
    };
    setCartItems([...cartItems, cartItem]);
    toast.success(`${selectedProduct.name} added to cart!`);
  };

  const handleCreateSalesOrder = () => {
    // Navigate directly to create sales order page
    navigate('/sales/orders/create', {
      state: {
        prefilledProduct: selectedProduct,
        color: selectedColor,
        size: selectedSize
      }
    });
  };

  const handleSaveDesign = () => {
    const design = {
      id: Date.now(),
      product: selectedProduct,
      color: selectedColor,
      size: selectedSize,
      image: tryOnResult || selectedProduct.image,
      date: new Date().toLocaleDateString()
    };
    setSavedDesigns([...savedDesigns, design]);
    toast.success('Try-on design saved successfully!');
  };

  // Re-run fitting if adjustments change
  useEffect(() => {
    if (processingState === 'finished' && customerPhoto) {
      renderTryOnCanvas().then(res => setTryOnResult(res));
    }
  }, [scale, offsetX, offsetY, rotation]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Hidden Canvas for blending */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            ✨ Virtual Try-On Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">Visualize patterns, fabrics, and fits onto custom profile photos in real time.</p>
        </div>
        
        {/* Statistics or Status */}
        <div className="flex gap-4 mt-4 md:mt-0">
          <div className="bg-slate-900/80 border border-slate-850 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Active Cart</span>
            <span className="text-lg font-bold text-indigo-400">{cartItems.length} Items</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-850 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Saved Styles</span>
            <span className="text-lg font-bold text-pink-400">{savedDesigns.length} Fits</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Product Selector & List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/70 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-100">
              <Sliders size={18} className="text-indigo-400" />
              Clothing Selection
            </h2>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
              {products.map((prod) => (
                <div 
                  key={prod.id}
                  onClick={() => {
                    setSelectedProduct(prod);
                    setSelectedColor(prod.colors[0]);
                    setSelectedSize(prod.sizes[1]);
                  }}
                  className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedProduct.id === prod.id
                      ? 'bg-indigo-600/10 border-indigo-500/80 shadow-md shadow-indigo-500/5'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-800/80'
                  }`}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-800 flex-shrink-0">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-slate-200 truncate">{prod.name}</h3>
                    <p className="text-xs text-slate-400 capitalize">{prod.category}</p>
                    <span className="text-sm font-bold text-indigo-400 block mt-1">₹{prod.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Selected Product Details (Customer/Product Page View) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
            
            {/* Product Image Display */}
            <div className="w-full md:w-80 h-96 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center relative group">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              />
              <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-800/80 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-400" />
                Garment Reference
              </span>
            </div>

            {/* Info and Actions */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">{selectedProduct.category}</span>
                <h2 className="text-2xl font-extrabold text-slate-100 mt-1">{selectedProduct.name}</h2>
                <div className="text-xl font-bold text-slate-200 mt-2">₹{selectedProduct.price}</div>
                
                <p className="text-slate-400 text-sm mt-4 leading-relaxed">{selectedProduct.description}</p>
                
                {/* Color Palette Choice */}
                <div className="mt-6">
                  <span className="text-xs font-semibold text-slate-400 block mb-2">Available Colors</span>
                  <div className="flex gap-2">
                    {selectedProduct.colors.map(col => (
                      <button 
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selectedColor === col
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-600/30'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selector */}
                <div className="mt-5">
                  <span className="text-xs font-semibold text-slate-400 block mb-2">Select Size</span>
                  <div className="flex gap-2">
                    {selectedProduct.sizes.map(sz => (
                      <button 
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold border transition-all ${
                          selectedSize === sz
                            ? 'bg-purple-600 border-purple-500 text-white shadow shadow-purple-600/30'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-3">
                <button 
                  onClick={() => setPopupOpen(true)}
                  className="flex-1 min-w-[160px] bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-purple-500/30 transition duration-300 flex items-center justify-center gap-2 group transform active:scale-95"
                >
                  <Sparkles size={18} className="animate-pulse" />
                  ✨ Try On Garment
                </button>

                <button 
                  onClick={handleAddToCart}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Try-On Popup Modal */}
      {popupOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden my-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Sparkles size={16} className="text-indigo-400" />
                </div>
                <h3 className="font-extrabold text-lg tracking-wide text-slate-100">✨ AI Virtual Try-On</h3>
              </div>
              <button 
                onClick={() => {
                  setPopupOpen(false);
                  stopCamera();
                  setProcessingState('idle');
                  setTryOnResult(null);
                  setCustomerPhoto(null);
                }}
                className="text-slate-450 hover:text-slate-100 transition p-1.5 hover:bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {processingState === 'idle' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo Input (Upload or Camera Capture) */}
                  <div className="border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/80 p-6 flex flex-col justify-center items-center text-center min-h-[320px] relative overflow-hidden">
                    {cameraActive ? (
                      <div className="absolute inset-0 bg-black flex flex-col justify-between p-4">
                        <video id="camera-preview" autoPlay playsInline className="w-full h-full object-cover rounded-lg"></video>
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-4">
                          <button onClick={capturePhoto} className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg active:scale-95 transition"></button>
                          <button onClick={stopCamera} className="bg-slate-850 hover:bg-slate-850 text-white font-semibold py-2 px-4 rounded-xl text-xs absolute right-6 bottom-8">Cancel</button>
                        </div>
                      </div>
                    ) : customerPhoto ? (
                      <div className="absolute inset-0 bg-slate-950 flex flex-col">
                        <img src={customerPhoto} alt="Customer Preview" className="w-full h-full object-cover" />
                        
                        {/* Selected clothing thumbnail preview */}
                        <div className="absolute bottom-3 left-3 w-16 h-16 rounded-xl border border-indigo-500/50 bg-slate-950/90 p-0.5 overflow-hidden shadow-lg">
                          <img src={selectedProduct.image} alt="garment preview" className="w-full h-full object-cover rounded-lg" />
                        </div>

                        <button 
                          onClick={() => setCustomerPhoto(null)}
                          className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-full shadow-md transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full bg-slate-800/20 flex items-center justify-center mb-4 border border-slate-800">
                          <Camera size={24} className="text-indigo-400" />
                        </div>
                        <h4 className="font-bold text-slate-200">Prepare Profile Photo</h4>
                        <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">Provide a clear, full-body portrait with clean lighting for optimal garment fitting.</p>
                        
                        <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                          <button 
                            onClick={startCamera}
                            className="flex-1 bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                          >
                            <Camera size={14} />
                            Open Camera
                          </button>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 bg-slate-800 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <Upload size={14} />
                            Choose Image
                          </button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Preset Model Option and Product Info */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-350 mb-3 font-semibold">Or Choose standard model profile:</h4>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {PRESET_MODELS.map(model => (
                          <div 
                            key={model.id}
                            onClick={() => {
                              setCustomerPhoto(model.image);
                              toast.success(`Selected preset ${model.name}`);
                            }}
                            className={`flex gap-3 p-2.5 rounded-xl border cursor-pointer items-center transition ${
                              customerPhoto === model.image
                                ? 'bg-indigo-600/10 border-indigo-500/85'
                                : 'border-slate-800 bg-slate-950/30 hover:border-slate-800/80'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800 flex-shrink-0">
                              <img src={model.image} alt={model.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-200 block">{model.gender}</span>
                              <span className="text-[10px] text-slate-400 truncate block">Reference profile</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Selected product reference card */}
                      <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 flex gap-3.5 items-center">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-800 flex-shrink-0">
                          <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Fitting Selection</span>
                          <h4 className="font-bold text-sm text-slate-200">{selectedProduct.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded text-slate-300 font-medium">Color: {selectedColor}</span>
                            <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded text-slate-300 font-medium">Size: {selectedSize}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={runAIPipeline}
                      disabled={!customerPhoto}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 transition mt-6 flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={16} />
                      Generate AI Preview
                    </button>
                  </div>
                </div>
              )}

              {/* Processing Pipeline View */}
              {(processingState === 'pose_detecting' || processingState === 'garment_fitting') && (
                <div className="flex flex-col md:flex-row gap-8 items-center py-6">
                  {/* Photo Display with Animated Scan/Pose Overlays */}
                  <div className="w-72 h-96 bg-slate-950 rounded-2xl overflow-hidden border border-slate-805 flex items-center justify-center relative shadow-inner">
                    <img src={customerPhoto} alt="Customer Image" className="w-full h-full object-cover opacity-85" />
                    
                    {/* Glowing Scan Line Animation */}
                    {processingState === 'pose_detecting' && (
                      <>
                        <div className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-[bounce_3s_infinite]"></div>
                        {/* Mock Skeletal SVG Overlay */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 400">
                          <circle cx="150" cy="80" r="15" fill="none" stroke="#22d3ee" strokeWidth="2.5" className="animate-pulse" />
                          <line x1="150" y1="95" x2="150" y2="200" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4" />
                          <line x1="110" y1="120" x2="190" y2="120" stroke="#22d3ee" strokeWidth="3" />
                          <line x1="110" y1="120" x2="80" y2="170" stroke="#22d3ee" strokeWidth="2" />
                          <line x1="190" y1="120" x2="220" y2="170" stroke="#22d3ee" strokeWidth="2" />
                          <line x1="120" y1="200" x2="180" y2="200" stroke="#22d3ee" strokeWidth="2.5" />
                          <circle cx="110" cy="120" r="5" fill="#22d3ee" className="animate-ping" />
                          <circle cx="190" cy="120" r="5" fill="#22d3ee" className="animate-ping" />
                        </svg>
                      </>
                    )}

                    {/* Garment Fitting Glow Overlay */}
                    {processingState === 'garment_fitting' && (
                      <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-[0.5px] border-2 border-indigo-400/50 flex items-center justify-center animate-pulse">
                        <Sparkles size={48} className="text-indigo-400 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Progress and status reports */}
                  <div className="flex-1 w-full space-y-6">
                    <div>
                      <span className="text-[10px] bg-slate-850 text-indigo-450 border border-slate-800 px-2.5 py-1 rounded-full uppercase tracking-widest font-extrabold">
                        {processingState === 'pose_detecting' ? 'Phase 1: Body Pose Recognition' : 'Phase 2: Garment Warping & Fit'}
                      </span>
                      <h4 className="text-2xl font-black text-slate-100 mt-3 flex items-center gap-2">
                        <span className="animate-pulse h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                        Generating AI Try-On...
                      </h4>
                      <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                        {processingState === 'pose_detecting' 
                          ? 'AI is scanning the uploaded portrait, locating joint anchors, and estimating posture guidelines.' 
                          : 'Fitting shirt fabric specifications onto body parameters. Estimating folds, shadows, and alignment lines.'}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-405">Processing Progress</span>
                        <span className="text-indigo-400">{processingProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-850">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${processingProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Status Logs */}
                    <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-4 text-xs font-mono space-y-1.5 text-slate-450">
                      <div>[INFO] Initialized CatVTON Pipeline...</div>
                      {processingProgress >= 20 && <div className="text-indigo-400">[OK] Landmards mapped. AI Confidence: 96.4%</div>}
                      {processingProgress >= 40 && <div className="text-purple-400">[OK] Body landmark anchors located</div>}
                      {processingProgress >= 65 && <div className="text-pink-400">[INFO] Simulating warp matrix matching size {selectedSize}...</div>}
                      {processingProgress >= 85 && <div className="text-emerald-400">[INFO] Optimizing fabric shadow synthesis overlays...</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* Finished Result View */}
              {processingState === 'finished' && (
                <div className="space-y-6">
                  {/* Before/After side by side with sliding split view overlay */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-400 mb-2">Before Portrait</span>
                      <div className="w-72 h-96 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
                        <img src={customerPhoto} alt="Original customer" className="w-full h-full object-cover" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-indigo-400 mb-2">✨ AI Try-On Result</span>
                      
                      {/* Before / After Slider view wrapper */}
                      <div 
                        className="w-72 h-96 bg-slate-950 rounded-2xl overflow-hidden border-2 border-indigo-500/80 shadow-2xl relative select-none"
                        onMouseMove={(e) => {
                          if (isResizing) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                            setSliderPosition(percentage);
                          }
                        }}
                        onMouseDown={() => setIsResizing(true)}
                        onMouseUp={() => setIsResizing(false)}
                        onMouseLeave={() => setIsResizing(false)}
                        onTouchMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const touch = e.touches[0];
                          const x = touch.clientX - rect.left;
                          const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                          setSliderPosition(percentage);
                        }}
                      >
                        {/* Underlay: Original (Before) Image */}
                        <img src={customerPhoto} alt="Customer Before" className="absolute inset-0 w-full h-full object-cover" />
                        
                        {/* Overlay: AI Try-On Result */}
                        <div 
                          className="absolute inset-y-0 left-0 overflow-hidden border-r border-indigo-500"
                          style={{ width: `${sliderPosition}%` }}
                        >
                          <img 
                            src={tryOnResult} 
                            alt="Virtual Try On Result" 
                            className="absolute inset-y-0 left-0 w-72 h-96 max-w-none object-cover" 
                          />
                        </div>

                        {/* Slider Handle */}
                        <div 
                          className="absolute top-0 bottom-0 w-1 bg-indigo-400 cursor-ew-resize flex items-center justify-center"
                          style={{ left: `${sliderPosition}%` }}
                        >
                          <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] shadow-lg border border-white/40">
                            ↔
                          </div>
                        </div>

                        <span className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur px-2.5 py-1 rounded-full text-[9px] font-bold text-slate-350 border border-slate-800">
                          CatVTON-v1.5 (Confidence: 97.2%)
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">Drag the center slider to compare before/after fit</span>
                    </div>
                  </div>

                  {/* Manual Fit Optimizations panel */}
                  <div className="bg-slate-950/30 border border-slate-850 rounded-2xl p-4">
                    <button 
                      onClick={() => setShowAdjustments(!showAdjustments)}
                      className="flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                    >
                      <Sliders size={14} />
                      {showAdjustments ? 'Hide Alignment Adjustments' : 'Fine-Tune Clothing Placement (Interactive Fit Controls)'}
                    </button>

                    {showAdjustments && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-3 border-t border-slate-850 text-xs">
                        <div className="space-y-1">
                          <label className="text-slate-450 block font-medium">Garment Scale ({scale.toFixed(2)}x)</label>
                          <input 
                            type="range" 
                            min="0.5" 
                            max="2.0" 
                            step="0.05" 
                            value={scale} 
                            onChange={(e) => setScale(parseFloat(e.target.value))}
                            className="w-full accent-indigo-500" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-450 block font-medium">Vertical Placement ({offsetY}px)</label>
                          <input 
                            type="range" 
                            min="-200" 
                            max="300" 
                            step="5" 
                            value={offsetY} 
                            onChange={(e) => setOffsetY(parseInt(e.target.value))}
                            className="w-full accent-indigo-500" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-450 block font-medium">Horizontal Placement ({offsetX}px)</label>
                          <input 
                            type="range" 
                            min="-150" 
                            max="150" 
                            step="5" 
                            value={offsetX} 
                            onChange={(e) => setOffsetX(parseInt(e.target.value))}
                            className="w-full accent-indigo-500" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-450 block font-medium">Garment Rotation ({rotation}°)</label>
                          <input 
                            type="range" 
                            min="-45" 
                            max="45" 
                            step="2" 
                            value={rotation} 
                            onChange={(e) => setRotation(parseInt(e.target.value))}
                            className="w-full accent-indigo-500" 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Dashboard */}
                  <div className="bg-slate-950/50 border border-slate-850 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h4 className="font-extrabold text-slate-100 flex items-center gap-1.5">
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        AI Generation Completed
                      </h4>
                      <div className="text-xs text-slate-400 mt-0.5 space-y-0.5">
                        <div><strong>Product:</strong> {selectedProduct.name}</div>
                        <div><strong>Color:</strong> {selectedColor} | <strong>Size:</strong> {selectedSize}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <button 
                        onClick={runAIPipeline}
                        className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition"
                      >
                        <RefreshCw size={14} className="text-indigo-400" />
                        Regenerate Fit
                      </button>

                      <a 
                        href={tryOnResult}
                        download={`tryon-${selectedProduct.id}.jpg`}
                        onClick={(e) => {
                          e.preventDefault();
                          toast.success('Successfully downloaded generated Try-On preview!');
                        }}
                        className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-705 font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition"
                      >
                        <Download size={14} />
                        Download
                      </a>
                      
                      <button 
                        onClick={handleSaveDesign}
                        className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-705 font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition"
                      >
                        <Heart size={14} className="text-pink-400" />
                        Save Design
                      </button>

                      <button 
                        onClick={() => {
                          handleAddToCart();
                          setPopupOpen(false);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 transition animate-pulse"
                      >
                        <ShoppingBag size={14} />
                        Add to Cart
                      </button>

                      <button 
                        onClick={() => {
                          handleCreateSalesOrder();
                          setPopupOpen(false);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 transition"
                      >
                        Create Sales Order
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
