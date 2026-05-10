import { useEffect, useState } from "react";
import { getCategories } from "../handlers/categoryHandlers";
import { addProviderService } from "../handlers/providerHandlers"

const ManageServices = () => {
  const [services, setServices] = useState([]); // This would normally be fetched via getMyProviderDetails
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    category_id: "",
    title: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    // Fetch categories on mount
    getCategories().then(setCategories).catch(console.error);
    // Ideally fetch existing services here:
    // getMyProviderDetails().then(data => setServices(data.services));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newService = await addProviderService({
        ...formData,
        category_id: parseInt(formData.category_id),
        price: parseFloat(formData.price),
      });
      setServices([...services, newService]);
      setShowForm(false);
      setFormData({ category_id: "", title: "", description: "", price: "" });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-[40px] font-bold uppercase leading-none tracking-tight">
          Manage Services
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#111111] text-white px-6 py-3 text-sm font-bold uppercase hover:bg-[#ff4d2d] transition-colors"
        >
          {showForm ? "Cancel" : "+ Add New Service"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-[#1a1a1a] p-6 mb-8 flex flex-col gap-4">
          <h2 className="text-[20px] font-bold uppercase mb-2">Service Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-[#6b6b6b]">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="h-[48px] border border-[#1a1a1a] px-3 bg-white text-sm outline-none focus:border-[#ff4d2d] appearance-none rounded-none"
              >
                <option value="" disabled>SELECT CATEGORY</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-[#6b6b6b]">Base Price (PKR)</label>
              <input
                type="number"
                name="price"
                required
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                className="h-[48px] border border-[#1a1a1a] px-3 bg-white text-sm outline-none focus:border-[#ff4d2d]"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-[#6b6b6b]">Service Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="E.g., Deep House Cleaning"
              value={formData.title}
              onChange={handleChange}
              className="h-[48px] border border-[#1a1a1a] px-3 bg-white text-sm outline-none focus:border-[#ff4d2d]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-[#6b6b6b]">Description</label>
            <textarea
              name="description"
              rows="3"
              placeholder="Describe what is included..."
              value={formData.description}
              onChange={handleChange}
              className="border border-[#1a1a1a] p-3 bg-white text-sm outline-none focus:border-[#ff4d2d] resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#ff4d2d] text-white h-[48px] uppercase font-bold hover:bg-[#e84325] transition-colors self-start px-8"
          >
            {loading ? "Saving..." : "Save Service"}
          </button>
        </form>
      )}

      {/* SERVICES GRID */}
      {services.length === 0 ? (
        <div className="border border-[#1a1a1a] border-dashed p-12 text-center text-[#6b6b6b]">
          <p className="uppercase font-bold text-sm">No services added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white border border-[#1a1a1a] p-6 hover:scale-[1.02] transition-transform flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#111111] text-white px-2 py-1 text-[10px] uppercase font-bold tracking-widest">
                    Category #{service.category_id}
                  </span>
                  <span className="text-[#ea5455] font-bold text-xs uppercase cursor-pointer hover:underline">
                    Delete
                  </span>
                </div>
                <h3 className="text-[20px] font-bold uppercase leading-tight mb-2">{service.title}</h3>
                <p className="text-sm text-[#6b6b6b] line-clamp-3">{service.description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1a1a1a] flex justify-between items-end">
                <span className="text-xs font-bold uppercase text-[#6b6b6b]">Price</span>
                <span className="text-[24px] font-extrabold text-[#ff4d2d]">Rs. {service.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageServices;