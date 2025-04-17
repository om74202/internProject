import axios from "axios"

export const ListCard=({title})=>{
    const handleDelete=async()=>{
        try{const response =await axios.delete(`http://localhost:3001/addVariable/${title}`);
        console.log("deleted ", response.data)
        }catch(e){
            console.log(e);
        }
    }

    const handleEdit=async()=>{

    }
    
    return (
        <div className="w-screen mx-auto  rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4">
  {/* <!-- Card Header with Icons --> */}
  <div className="flex justify-between items-center p-4 bg-green-100 hover:bg-green-200 border-b w-full">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <div className="flex space-x-2">
      {/* <!-- Edit Icon --> */}
      <button onClick={handleEdit}  class="text-blue-500 hover:text-blue-700 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>
      {/* <!-- Delete Icon --> */}
      <button onClick={handleDelete} class="text-red-500 hover:text-red-700 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</div>
    )
}