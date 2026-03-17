import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/MainLayout';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useParams, useNavigate } from 'react-router-dom';

function ProfilePage() {

const { id } = useParams();
const navigate = useNavigate();

const [profileData, setProfileData] = useState(null);
const [currentUser, setCurrentUser] = useState(null);
const [userPosts, setUserPosts] = useState([]);

const [activeTab, setActiveTab] = useState("posts");

const [isEditing, setIsEditing] = useState(false);
const [connectionStatus, setConnectionStatus] = useState(null);
const [connectionId, setConnectionId] = useState(null);

const [editForm, setEditForm] = useState({
role: 'student',
department: '',
graduationYear: '',
bio: '',
skills: ''
});

const [selectedFile, setSelectedFile] = useState(null);

useEffect(() => {
fetchCurrentUser();
}, []);

useEffect(() => {
if (currentUser) {
const targetId = id || currentUser._id;
fetchProfile(targetId);
fetchUserPosts(targetId);
if (targetId !== currentUser._id) {
    fetchConnectionStatus(targetId);
}
}
}, [id, currentUser]);

const fetchConnectionStatus = async (targetId) => {
try {
const token = localStorage.getItem('token');
const res = await axios.get(`http://localhost:5000/api/connections/status/${targetId}`, {
headers: { Authorization: `Bearer ${token}` }
});
setConnectionStatus(res.data.status);
if (res.data.connectionId) {
    setConnectionId(res.data.connectionId);
}
} catch (error) {
console.error("Error fetching connection status", error);
}
};

const fetchCurrentUser = async () => {
try {

const token = localStorage.getItem('token');

if (!token) {
navigate('/signin');
return;
}

const res = await axios.get(
'http://localhost:5000/api/user/profile',
{ headers: { Authorization: `Bearer ${token}` } }
);

setCurrentUser(res.data.user);

} catch (error) {
console.error(error);
if (error.response && (error.response.status === 401 || error.response.status === 404)) {
localStorage.removeItem('token');
navigate('/signin');
}
}
};

const fetchProfile = async (userId) => {

try {

const token = localStorage.getItem('token');

const res = await axios.get(
`http://localhost:5000/api/user/${userId}`,
{ headers: { Authorization: `Bearer ${token}` } }
);

setProfileData(res.data);

if (currentUser && userId === currentUser._id) {

setEditForm({
role: res.data.role || "student",
department: res.data.department || "",
graduationYear: res.data.graduationYear || "",
bio: res.data.bio || "",
skills: res.data.skills ? res.data.skills.join(", ") : ""
});

}

} catch (error) {
console.error(error);
}

};

const fetchUserPosts = async (userId) => {

try {

const token = localStorage.getItem('token');

const res = await axios.get(
'http://localhost:5000/api/posts/feed',
{ headers: { Authorization: `Bearer ${token}` } }
);

const filtered = res.data.filter(
p => p.author._id === userId
);

setUserPosts(filtered);

} catch (error) {
console.error(error);
}

};

const handleEditChange = (e) => {

setEditForm({
...editForm,
[e.target.name]: e.target.value
});

};

const handleEditSubmit = async (e) => {

e.preventDefault();

try {

const token = localStorage.getItem('token');

let newProfilePicture = profileData.profilePicture;

if (selectedFile) {

const formData = new FormData();

formData.append("profileImage", selectedFile);

const uploadRes = await axios.post(
'http://localhost:5000/api/user/upload-profile-picture',
formData,
{
headers:{
Authorization:`Bearer ${token}`,
'Content-Type':'multipart/form-data'
}
}
);

newProfilePicture = uploadRes.data.user.profilePicture;

}

const updatedData = {
...editForm,
skills: editForm.skills
.split(',')
.map(s=>s.trim())
.filter(s=>s)
};

const res = await axios.put(
'http://localhost:5000/api/user/update',
updatedData,
{ headers:{ Authorization:`Bearer ${token}` } }
);

setProfileData({
...res.data,
profilePicture:newProfilePicture
});

setIsEditing(false);
setSelectedFile(null);

} catch (error) {
console.error(error);
}

};

const handleConnect = async () => {

try {

const token = localStorage.getItem('token');

await axios.post(
'http://localhost:5000/api/connections/send',
{ receiverId: profileData._id },
{ headers:{ Authorization:`Bearer ${token}` } }
);

setConnectionStatus('request_sent');
alert("Connection Request Sent");

} catch (error) {

alert("Already requested or connected");

}

};

const handleAccept = async () => {
try {
const token = localStorage.getItem('token');
await axios.post(`http://localhost:5000/api/connections/accept`, { connectionId }, {
headers: { Authorization: `Bearer ${token}` }
});
setConnectionStatus('connected');
} catch (error) {
alert("Error accepting request");
}
};

const handleReject = async () => {
try {
const token = localStorage.getItem('token');
await axios.post(`http://localhost:5000/api/connections/reject`, { connectionId }, {
headers: { Authorization: `Bearer ${token}` }
});
setConnectionStatus('not_connected');
setConnectionId(null);
} catch (error) {
alert("Error rejecting request");
}
};

const handleMessage = () => {
    navigate('/chat');
};

if (!profileData || !currentUser)
return (
<div className="flex justify-center mt-20">
<LoadingSpinner size="lg"/>
</div>
);

const isMyProfile = profileData._id === currentUser._id;

return (

<MainLayout>

<div className="max-w-6xl mx-auto pb-10">

{/* PROFILE HEADER */}

<div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden text-white">

<div className="h-32 bg-gradient-to-r from-blue-900/50 to-indigo-900/50"/>

<div className="px-6 pb-6 relative">

<div className="absolute -top-12 h-24 w-24 rounded-full border-4 border-black overflow-hidden">

{profileData.profilePicture ? (

<img
src={profileData.profilePicture}
alt="profile"
className="h-full w-full object-cover"
/>

):(

<div className="h-full w-full flex items-center justify-center bg-blue-700 text-3xl font-bold">

{profileData.username?.charAt(0)?.toUpperCase()}

</div>

)}

</div>

<div className="ml-28 pt-3 flex justify-between items-center">

<div>

<h1 className="text-2xl font-bold">

{profileData.username}

</h1>

<p className="text-white/60 text-sm">

{profileData.email}

</p>

<p className="text-blue-400 text-sm mt-1">

{profileData.connections?.length || 0} connections

</p>

</div>

{isMyProfile ? (

<button
onClick={()=>setIsEditing(!isEditing)}
className="bg-white/10 px-4 py-1 rounded"
>
{isEditing ? "Cancel":"Edit Profile"}
</button>

):(

<div className="flex gap-2">
{connectionStatus === 'not_connected' && (
<button onClick={handleConnect} className="bg-blue-600 px-5 py-1 rounded hover:bg-blue-700 transition">Connect</button>
)}
{connectionStatus === 'request_sent' && (
<button disabled className="bg-gray-600 px-5 py-1 rounded cursor-not-allowed">Pending</button>
)}
{connectionStatus === 'request_received' && (
<>
<button onClick={handleAccept} className="bg-green-600 px-5 py-1 rounded hover:bg-green-700 transition">Accept</button>
<button onClick={handleReject} className="bg-red-600 px-5 py-1 rounded hover:bg-red-700 transition">Reject</button>
</>
)}
{connectionStatus === 'connected' && (
<button onClick={handleMessage} className="bg-indigo-600 px-5 py-1 rounded hover:bg-indigo-700 transition">Message</button>
)}
</div>

)}

</div>

</div>

</div>


{/* MAIN GRID */}

<div className="grid grid-cols-3 gap-6 mt-6">


{/* LEFT SIDEBAR */}

<div className="col-span-1 space-y-6">

<div className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10">

<h3 className="font-semibold mb-2">

About

</h3>

<p className="text-sm text-white/80">

{profileData.bio || "No bio provided"}

</p>

</div>


<div className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10">

<h3 className="font-semibold mb-3">

Skills

</h3>

<div className="flex flex-wrap gap-2">

{profileData.skills?.length > 0 ? (

profileData.skills.map((skill,i)=>(

<span
key={i}
className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded"
>
{skill}
</span>

))

):(

<p className="text-white/40 text-sm">

No skills added

</p>

)}

</div>

</div>

</div>


{/* RIGHT COLUMN */}

<div className="col-span-2">

{/* TABS */}

<div className="flex border-b border-white/10 mb-4 text-sm">

<button
onClick={()=>setActiveTab("posts")}
className={`px-6 py-2 ${
activeTab==="posts"
? "border-b-2 border-blue-500 text-blue-400"
: "text-white/60"
}`}
>

Posts

</button>


<button
onClick={()=>setActiveTab("about")}
className={`px-6 py-2 ${
activeTab==="about"
? "border-b-2 border-blue-500 text-blue-400"
: "text-white/60"
}`}
>

About

</button>


<button
onClick={()=>setActiveTab("skills")}
className={`px-6 py-2 ${
activeTab==="skills"
? "border-b-2 border-blue-500 text-blue-400"
: "text-white/60"
}`}
>

Skills

</button>

</div>


{/* TAB CONTENT */}

{activeTab==="posts" && (

<div className="space-y-4">

{userPosts.length===0 ? (

<p className="text-white/50 text-center">

No posts yet

</p>

):(

userPosts.map(post=>(

<PostCard
key={post._id}
post={post}
currentUserId={currentUser._id}
/>

))

)}

</div>

)}


{activeTab==="about" && (

<div className="bg-white/5 p-6 rounded-xl border border-white/10">

<p className="text-white/80">

{profileData.bio || "No bio"}

</p>

</div>

)}


{activeTab==="skills" && (

<div className="bg-white/5 p-6 rounded-xl border border-white/10">

<div className="flex flex-wrap gap-2">

{profileData.skills?.map((s,i)=>(

<span
key={i}
className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded"
>

{s}

</span>

))}

</div>

</div>

)}

</div>

</div>

</div>

</MainLayout>

);

}

export default ProfilePage;