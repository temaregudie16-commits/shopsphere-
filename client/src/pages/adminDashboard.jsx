import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const SERVER_URL = "http://localhost:5000";

function AdminDashboard() {
  const navigate = useNavigate();

  // =====================================================
  // ADMIN USER
  // =====================================================

  const [adminUser, setAdminUser] = useState({});

  // =====================================================
  // ADMIN PROFILE PHOTO
  // =====================================================

  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [profilePhotoSaving, setProfilePhotoSaving] = useState(false);

  // =====================================================
  // MAIN DATA
  // =====================================================

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // =====================================================
  // STATS
  // =====================================================

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalSales: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    activeCoupons: 0,
  });

  // =====================================================
  // ADMIN OVERVIEW ANALYTICS
  // =====================================================

  const [overview, setOverview] = useState({
    revenue: [],
    recentOrders: [],
    lowStockProducts: [],
    topProducts: [],
    orderStatus: [],
  });

  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState("");

  // =====================================================
  // UI
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [activeSection, setActiveSection] = useState("overview");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =====================================================
  // CATEGORY PANEL
  // =====================================================

  const [showCategoryPanel, setShowCategoryPanel] = useState(false);

  // =====================================================
  // PRODUCT FORM
  // =====================================================

  const [showForm, setShowForm] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [imagePreview, setImagePreview] = useState("");
  const [image2Preview, setImage2Preview] = useState("");
  const [image3Preview, setImage3Preview] = useState("");

  const emptyProductForm = {
    category_id: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    image: null,
    image2: null,
    image3: null,
  };

  const [formData, setFormData] = useState(emptyProductForm);

  // =====================================================
  // ORDER DETAILS
  // =====================================================

  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);

  // =====================================================
  // CUSTOMER DETAILS
  // =====================================================

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // =====================================================
  // ADMIN DETAILS
  // =====================================================

  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // =====================================================
  // CREATE ADMIN
  // =====================================================

  const [showAdminForm, setShowAdminForm] = useState(false);

  const [adminSaving, setAdminSaving] = useState(false);

  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // =====================================================
  // COUPON
  // =====================================================

  const [showCouponForm, setShowCouponForm] = useState(false);

  const [editingCoupon, setEditingCoupon] = useState(null);

  const [couponSaving, setCouponSaving] = useState(false);

  const [couponSearch, setCouponSearch] = useState("");

  const emptyCouponForm = {
    code: "",
    discount_type: "percentage",
    discount_value: "",
    minimum_order: "0",
    usage_limit: "",
    expires_at: "",
    is_active: 1,
  };

  const [couponForm, setCouponForm] = useState(emptyCouponForm);

  // =====================================================
  // NOTIFICATION
  // =====================================================

  const [notificationLoading, setNotificationLoading] = useState(false);

  const [notificationSending, setNotificationSending] = useState(false);

  const [notificationSearch, setNotificationSearch] = useState("");

  const [notificationTypeFilter, setNotificationTypeFilter] = useState("all");

  const [notificationReadFilter, setNotificationReadFilter] = useState("all");

  const emptyNotificationForm = {
    user_id: "",
    title: "",
    message: "",
    type: "promotion",
  };

  const [notificationForm, setNotificationForm] = useState(
    emptyNotificationForm,
  );

  // =====================================================
  // FILTERS
  // =====================================================

  const [productSearch, setProductSearch] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("all");

  const [stockFilter, setStockFilter] = useState("all");

  const [orderSearch, setOrderSearch] = useState("");

  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const [customerSearch, setCustomerSearch] = useState("");

  const [adminSearch, setAdminSearch] = useState("");

  // =====================================================
  // SETTINGS
  // =====================================================

  const defaultSettings = {
    storeName: "ShopSphere",
    storeEmail: "",
    storePhone: "",
    currency: "USD",
    lowStockLimit: 10,
    autoRefresh: true,
    maintenanceMode: false,

    orderNotifications: true,
    paymentNotifications: true,
    promotionNotifications: true,
    systemNotifications: true,
  };

  const [settings, setSettings] = useState(defaultSettings);

  const [settingsSaved, setSettingsSaved] = useState(false);

  // =====================================================
  // LOAD ADMIN USER
  // =====================================================

  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

      setAdminUser(savedUser);
    } catch (error) {
      console.error("ADMIN USER ERROR:", error);

      setAdminUser({});
    }
  }, []);

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      String(image).startsWith("http://") ||
      String(image).startsWith("https://")
    ) {
      return image;
    }

    if (String(image).startsWith("/uploads/")) {
      return `${SERVER_URL}${image}`;
    }

    return `${SERVER_URL}/uploads/${image}`;
  };

  // =====================================================
  // PROFILE IMAGE URL
  // =====================================================

  const getProfileImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      String(image).startsWith("http://") ||
      String(image).startsWith("https://")
    ) {
      return image;
    }

    if (String(image).startsWith("/uploads/")) {
      return `${SERVER_URL}${image}`;
    }

    return `${SERVER_URL}/uploads/profile/${image}`;
  };

  // =====================================================
  // ADMIN PROFILE PHOTO UPLOAD
  // =====================================================

  const handleProfilePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, JPEG, PNG and WEBP images are allowed.");

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB.");

      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setProfilePhotoPreview(previewUrl);
    setProfilePhotoSaving(true);

    try {
      const data = new FormData();

      data.append("profile_image", file);

      const response = await api.put("/users/profile/photo", data);

      if (response.data?.success) {
        const image = response.data.profile_image;

        const updatedUser = {
          ...adminUser,
          profile_image: image,
        };

        setAdminUser(updatedUser);

        localStorage.setItem("user", JSON.stringify(updatedUser));

        setProfilePhotoPreview("");

        alert(response.data?.message || "Profile photo uploaded successfully.");
      } else {
        setProfilePhotoPreview("");

        alert(response.data?.message || "Failed to upload profile photo.");
      }
    } catch (error) {
      console.error("PROFILE PHOTO ERROR:", error);

      setProfilePhotoPreview("");

      alert(error.response?.data?.message || "Failed to upload profile photo.");
    } finally {
      setProfilePhotoSaving(false);

      event.target.value = "";

      URL.revokeObjectURL(previewUrl);
    }
  };

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("shopsphere_admin_settings");

      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);

        setSettings((previous) => ({
          ...previous,
          ...parsed,
        }));
      }
    } catch (error) {
      console.error("LOAD SETTINGS ERROR:", error);
    }
  }, []);

  // =====================================================
  // MONEY
  // =====================================================

  const money = (value) => {
    const amount = Number(value || 0);

    if (settings.currency === "ETB") {
      return `Br ${amount.toFixed(2)}`;
    }

    return `$${amount.toFixed(2)}`;
  };

  // =====================================================
  // ORDER METRICS
  // =====================================================

  const pendingOrders = orders.filter(
    (order) =>
      String(order.status || "")
        .trim()
        .toLowerCase() === "pending",
  );

  const processingOrders = orders.filter(
    (order) =>
      String(order.status || "")
        .trim()
        .toLowerCase() === "processing",
  );

  const paidOrders = orders.filter(
    (order) =>
      String(order.status || "")
        .trim()
        .toLowerCase() === "paid",
  );

  const shippedOrders = orders.filter(
    (order) =>
      String(order.status || "")
        .trim()
        .toLowerCase() === "shipped",
  );

  const completedOrders = orders.filter(
    (order) =>
      String(order.status || "")
        .trim()
        .toLowerCase() === "completed",
  );

  const cancelledOrders = orders.filter(
    (order) =>
      String(order.status || "")
        .trim()
        .toLowerCase() === "cancelled",
  );

  const averageOrderValue =
    orders.length > 0
      ? orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0) /
        orders.length
      : 0;

  // =====================================================
  // ANALYTICS HELPERS
  // =====================================================

  const formatAnalyticsDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const sevenDayRevenue = useMemo(() => {
    const byDate = new Map();

    (overview.revenue || []).forEach((row) => {
      const key = String(row.saleDate).slice(0, 10);

      byDate.set(key, Number(row.revenue || 0));
    });

    const days = [];

    const today = new Date();

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(today);

      date.setHours(0, 0, 0, 0);

      date.setDate(today.getDate() - index);

      const key = date.toISOString().slice(0, 10);

      days.push({
        date: key,
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        value: byDate.get(key) || 0,
      });
    }

    return days;
  }, [overview.revenue]);

  const maxRevenue = Math.max(...sevenDayRevenue.map((item) => item.value), 1);

  const pendingValue = pendingOrders.reduce(
    (sum, order) => sum + Number(order.total_price || 0),
    0,
  );

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.dispatchEvent(new Event("authChanged"));

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  const loadProducts = async () => {
    try {
      const response = await api.get("/products");

      setProducts(response.data?.products || []);
    } catch (error) {
      console.error("LOAD PRODUCTS ERROR:", error);

      setProducts([]);
    }
  };

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  const loadCategories = async () => {
    try {
      const response = await api.get("/categories");

      setCategories(response.data?.categories || []);
    } catch (error) {
      console.error("LOAD CATEGORIES ERROR:", error);

      setCategories([]);
    }
  };

  // =====================================================
  // LOAD STATS
  // =====================================================

  const loadStats = async () => {
    try {
      const response = await api.get("/admin/stats");

      if (response.data?.stats) {
        setStats((previous) => ({
          ...previous,
          ...response.data.stats,
        }));
      }
    } catch (error) {
      console.error("LOAD STATS ERROR:", error);
    }
  };

  // =====================================================
  // LOAD ADMIN OVERVIEW ANALYTICS
  // =====================================================

  const loadDashboardOverview = async () => {
    try {
      setOverviewLoading(true);

      setOverviewError("");

      const response = await api.get("/admin/overview");

      if (response.data?.success) {
        setOverview(
          response.data.overview || {
            revenue: [],
            recentOrders: [],
            lowStockProducts: [],
            topProducts: [],
            orderStatus: [],
          },
        );
      } else {
        setOverviewError(
          response.data?.message || "Failed to load dashboard analytics.",
        );
      }
    } catch (error) {
      console.error("LOAD OVERVIEW ERROR:", error);

      setOverviewError(
        error.response?.data?.message || "Failed to load dashboard analytics.",
      );
    } finally {
      setOverviewLoading(false);
    }
  };

  // =====================================================
  // LOAD ORDERS
  // =====================================================

  const loadOrders = async () => {
    try {
      const response = await api.get("/orders/admin/all");

      setOrders(response.data?.orders || []);
    } catch (error) {
      console.error("LOAD ORDERS ERROR:", error);

      setOrders([]);
    }
  };

  // =====================================================
  // LOAD CUSTOMERS
  // =====================================================

  const loadCustomers = async () => {
    try {
      const response = await api.get("/users/admin/customers");

      setCustomers(response.data?.customers || []);
    } catch (error) {
      console.error("LOAD CUSTOMERS ERROR:", error);

      setCustomers([]);
    }
  };

  // =====================================================
  // LOAD ADMINS
  // =====================================================

  const loadAdmins = async () => {
    try {
      const response = await api.get("/users/admin/admins");

      setAdmins(response.data?.admins || []);
    } catch (error) {
      console.error("LOAD ADMINS ERROR:", error);

      setAdmins([]);
    }
  };

  // =====================================================
  // LOAD COUPONS
  // =====================================================

  const loadCoupons = async () => {
    try {
      const response = await api.get("/coupons/admin/all");

      setCoupons(response.data?.coupons || []);
    } catch (error) {
      console.error("LOAD COUPONS ERROR:", error);

      setCoupons([]);
    }
  };

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications = async () => {
    try {
      setNotificationLoading(true);

      const response = await api.get("/notifications/admin/all");

      if (response.data?.success) {
        setNotifications(response.data.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("LOAD NOTIFICATIONS ERROR:", error);

      setNotifications([]);

      if (error.response?.status === 401) {
        alert("Your admin session has expired.");

        handleLogout();
      }
    } finally {
      setNotificationLoading(false);
    }
  };

  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  const loadDashboard = async () => {
    setLoading(true);

    try {
      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadStats(),
        loadDashboardOverview(),
        loadOrders(),
        loadCustomers(),
        loadAdmins(),
        loadCoupons(),
        loadNotifications(),
      ]);
    } catch (error) {
      console.error("DASHBOARD LOAD ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // =====================================================
  // AUTO REFRESH
  // =====================================================

  useEffect(() => {
    if (!settings.autoRefresh) {
      return undefined;
    }

    const interval = setInterval(() => {
      loadProducts();
      loadCategories();
      loadStats();
      loadDashboardOverview();
      loadOrders();
      loadCustomers();
      loadAdmins();
      loadCoupons();
      loadNotifications();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [settings.autoRefresh]);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadStats(),
        loadDashboardOverview(),
        loadOrders(),
        loadCustomers(),
        loadAdmins(),
        loadCoupons(),
        loadNotifications(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // =====================================================
  // SECTION
  // =====================================================

  const changeSection = (section) => {
    setActiveSection(section);

    setSidebarOpen(false);

    if (section !== "products") {
      setShowForm(false);

      setEditingProduct(null);
    }

    if (section !== "admins") {
      setShowAdminForm(false);
    }

    if (section !== "coupons") {
      setShowCouponForm(false);
    }
  };

  // =====================================================
  // PRODUCT FORM
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event, fieldName) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, JPEG, PNG and WEBP images are allowed.");

      event.target.value = "";

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB.");

      event.target.value = "";

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [fieldName]: file,
    }));

    const previewUrl = URL.createObjectURL(file);

    if (fieldName === "image") {
      setImagePreview(previewUrl);
    } else if (fieldName === "image2") {
      setImage2Preview(previewUrl);
    } else if (fieldName === "image3") {
      setImage3Preview(previewUrl);
    }
  };

  const resetProductForm = () => {
    setFormData({
      ...emptyProductForm,
    });

    setImagePreview("");

    setImage2Preview("");

    setImage3Preview("");

    setEditingProduct(null);

    setShowForm(false);
  };

  const openAddProduct = () => {
    setFormData({
      ...emptyProductForm,
    });

    setImagePreview("");

    setImage2Preview("");

    setImage3Preview("");

    setEditingProduct(null);

    setShowForm(true);

    setActiveSection("products");
  };

  const editProduct = (product) => {
    setEditingProduct(product);

    setFormData({
      category_id: product.category_id || "",
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      image: null,
      image2: null,
      image3: null,
    });

    setImagePreview(getImageUrl(product.image));

    setImage2Preview(getImageUrl(product.image2));

    setImage3Preview(getImageUrl(product.image3));

    setShowForm(true);

    setActiveSection("products");
  };

  // =====================================================
  // PRODUCT SAVE
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.category_id ||
      !formData.name.trim() ||
      formData.price === "" ||
      formData.stock === ""
    ) {
      alert("Please fill all required fields.");

      return;
    }

    if (Number(formData.price) < 0) {
      alert("Price cannot be negative.");

      return;
    }

    if (Number(formData.stock) < 0) {
      alert("Stock cannot be negative.");

      return;
    }

    setSaving(true);

    try {
      const data = new FormData();

      data.append("category_id", formData.category_id);

      data.append("name", formData.name.trim());

      data.append("description", formData.description.trim());

      data.append("price", formData.price);

      data.append("stock", formData.stock);

      if (formData.image) {
        data.append("image", formData.image);
      }

      if (formData.image2) {
        data.append("image2", formData.image2);
      }

      if (formData.image3) {
        data.append("image3", formData.image3);
      }

      let response;

      if (editingProduct) {
        response = await api.put(`/products/${editingProduct.id}`, data);
      } else {
        response = await api.post("/products", data);
      }

      alert(response.data?.message || "Product saved successfully.");

      resetProductForm();

      await Promise.all([loadProducts(), loadStats()]);
    } catch (error) {
      console.error("SAVE PRODUCT ERROR:", error);

      alert(error.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  const deleteProduct = async (id) => {
    const product = products.find((item) => Number(item.id) === Number(id));

    const confirmed = window.confirm(
      `Delete "${product?.name || "this product"}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.delete(`/products/${id}`);

      alert(response.data?.message || "Product deleted successfully.");

      await Promise.all([loadProducts(), loadStats()]);
    } catch (error) {
      console.error("DELETE PRODUCT ERROR:", error);

      alert(error.response?.data?.message || "Failed to delete product.");
    }
  };

  // =====================================================
  // ORDER DETAILS
  // =====================================================

  const viewOrderDetails = async (id) => {
    try {
      const response = await api.get(`/orders/admin/${id}/details`);

      setSelectedOrder(response.data?.orderDetails || []);

      setShowOrderDetails(true);
    } catch (error) {
      console.error("ORDER DETAILS ERROR:", error);

      alert(error.response?.data?.message || "Failed to load order details.");
    }
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);

    setSelectedOrder(null);
  };

  // =====================================================
  // ORDER STATUS
  // =====================================================

  const updateOrderStatus = async (id, status) => {
    try {
      const response = await api.put(`/orders/admin/${id}/status`, {
        status,
      });

      alert(response.data?.message || "Order status updated.");

      await Promise.all([loadOrders(), loadStats(), loadNotifications()]);
    } catch (error) {
      console.error("UPDATE ORDER STATUS ERROR:", error);

      alert(error.response?.data?.message || "Failed to update order status.");
    }
  };

  // =====================================================
  // ADMIN
  // =====================================================

  const handleCreateAdmin = async (event) => {
    event.preventDefault();

    const name = adminForm.name.trim();

    const email = adminForm.email.trim();

    const password = adminForm.password;

    if (!name || !email || !password) {
      alert("Name, email and password are required.");

      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");

      return;
    }

    setAdminSaving(true);

    try {
      const response = await api.post("/users/admin/admins", {
        name,
        email,
        password,
      });

      alert(response.data?.message || "Administrator created successfully.");

      setAdminForm({
        name: "",
        email: "",
        password: "",
      });

      setShowAdminForm(false);

      await loadAdmins();
    } catch (error) {
      console.error("CREATE ADMIN ERROR:", error);

      alert(error.response?.data?.message || "Failed to create administrator.");
    } finally {
      setAdminSaving(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (Number(id) === Number(adminUser?.id)) {
      alert("You cannot delete your own administrator account.");

      return;
    }

    const target = admins.find((item) => Number(item.id) === Number(id));

    if (!target) {
      return;
    }

    const confirmed = window.confirm(`Delete administrator "${target.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.delete(`/users/admin/admins/${id}`);

      alert(response.data?.message || "Administrator deleted successfully.");

      await loadAdmins();
    } catch (error) {
      console.error("DELETE ADMIN ERROR:", error);

      alert(error.response?.data?.message || "Failed to delete administrator.");
    }
  };

  const handleChangeUserRole = async (id, role) => {
    if (Number(id) === Number(adminUser?.id)) {
      alert("You cannot change your own role.");

      return;
    }

    const confirmed = window.confirm(
      role === "admin"
        ? "Make this user an administrator?"
        : "Remove administrator access from this account?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.put(`/users/admin/users/${id}/role`, {
        role,
      });

      alert(response.data?.message || "Role updated successfully.");

      await Promise.all([loadAdmins(), loadCustomers()]);
    } catch (error) {
      console.error("CHANGE ROLE ERROR:", error);

      alert(error.response?.data?.message || "Failed to change role.");
    }
  };

  // =====================================================
  // COUPON
  // =====================================================

  const handleCouponChange = (event) => {
    const { name, value, type, checked } = event.target;

    setCouponForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const openAddCoupon = () => {
    setEditingCoupon(null);

    setCouponForm({
      ...emptyCouponForm,
    });

    setShowCouponForm(true);

    setActiveSection("coupons");
  };

  const editCoupon = (coupon) => {
    setEditingCoupon(coupon);

    setCouponForm({
      code: coupon.code || "",
      discount_type: coupon.discount_type || "percentage",
      discount_value: coupon.discount_value ?? "",
      minimum_order: coupon.minimum_order ?? "0",
      usage_limit: coupon.usage_limit ?? "",
      expires_at: coupon.expires_at
        ? new Date(coupon.expires_at).toISOString().slice(0, 16)
        : "",
      is_active: Number(coupon.is_active) ? 1 : 0,
    });

    setShowCouponForm(true);

    setActiveSection("coupons");
  };

  const resetCouponForm = () => {
    setCouponForm({
      ...emptyCouponForm,
    });

    setEditingCoupon(null);

    setShowCouponForm(false);
  };

  const handleCouponSubmit = async (event) => {
    event.preventDefault();

    const code = couponForm.code.trim().toUpperCase();

    const discountValue = Number(couponForm.discount_value);

    const minimumOrder = Number(couponForm.minimum_order || 0);

    const usageLimit =
      couponForm.usage_limit === "" ? null : Number(couponForm.usage_limit);

    if (!code) {
      alert("Coupon code is required.");

      return;
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      alert("Enter a valid discount value.");

      return;
    }

    if (couponForm.discount_type === "percentage" && discountValue > 100) {
      alert("Percentage cannot exceed 100%.");

      return;
    }

    if (!Number.isFinite(minimumOrder) || minimumOrder < 0) {
      alert("Invalid minimum order.");

      return;
    }

    if (
      usageLimit !== null &&
      (!Number.isFinite(usageLimit) || usageLimit < 1)
    ) {
      alert("Usage limit must be at least 1.");

      return;
    }

    setCouponSaving(true);

    try {
      const payload = {
        code,
        discount_type: couponForm.discount_type,
        discount_value: discountValue,
        minimum_order: minimumOrder,
        usage_limit: usageLimit,
        expires_at: couponForm.expires_at || null,
        is_active: Number(couponForm.is_active) ? 1 : 0,
      };

      let response;

      if (editingCoupon) {
        response = await api.put(`/coupons/admin/${editingCoupon.id}`, payload);
      } else {
        response = await api.post("/coupons/admin", payload);
      }

      alert(response.data?.message || "Coupon saved successfully.");

      resetCouponForm();

      await loadCoupons();
    } catch (error) {
      console.error("SAVE COUPON ERROR:", error);

      alert(error.response?.data?.message || "Failed to save coupon.");
    } finally {
      setCouponSaving(false);
    }
  };

  const deleteCoupon = async (id) => {
    const coupon = coupons.find((item) => Number(item.id) === Number(id));

    if (!coupon) {
      return;
    }

    const confirmed = window.confirm(`Delete coupon "${coupon.code}"?`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.delete(`/coupons/admin/${id}`);

      alert(response.data?.message || "Coupon deleted successfully.");

      await loadCoupons();
    } catch (error) {
      console.error("DELETE COUPON ERROR:", error);

      alert(error.response?.data?.message || "Failed to delete coupon.");
    }
  };

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const handleNotificationChange = (event) => {
    const { name, value } = event.target;

    setNotificationForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const sendNotification = async (sendToAll = false) => {
    if (!notificationForm.title.trim()) {
      alert("Notification title is required.");

      return;
    }

    if (!notificationForm.message.trim()) {
      alert("Notification message is required.");

      return;
    }

    if (!sendToAll && !notificationForm.user_id) {
      alert("Please select a customer.");

      return;
    }

    try {
      setNotificationSending(true);

      let response;

      if (sendToAll) {
        response = await api.post("/notifications/admin/send-all", {
          title: notificationForm.title.trim(),
          message: notificationForm.message.trim(),
          type: notificationForm.type,
        });
      } else {
        response = await api.post("/notifications/admin/send", {
          user_id: Number(notificationForm.user_id),
          title: notificationForm.title.trim(),
          message: notificationForm.message.trim(),
          type: notificationForm.type,
        });
      }

      if (response.data?.success) {
        alert(response.data?.message || "Notification sent successfully.");

        setNotificationForm({
          ...emptyNotificationForm,
        });

        await loadNotifications();
      } else {
        alert(response.data?.message || "Failed to send notification.");
      }
    } catch (error) {
      console.error("SEND NOTIFICATION ERROR:", error);

      alert(error.response?.data?.message || "Failed to send notification.");
    } finally {
      setNotificationSending(false);
    }
  };

  const deleteAdminNotification = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.delete(`/notifications/admin/${id}`);

      if (response.data?.success) {
        setNotifications((previous) =>
          previous.filter((item) => Number(item.id) !== Number(id)),
        );

        alert(response.data?.message || "Notification deleted successfully.");
      } else {
        alert(response.data?.message || "Failed to delete notification.");
      }
    } catch (error) {
      console.error("DELETE NOTIFICATION ERROR:", error);

      alert(error.response?.data?.message || "Failed to delete notification.");
    }
  };

  const openNotificationForCustomer = (customer) => {
    setNotificationForm((previous) => ({
      ...previous,
      user_id: customer.id,
      type: "promotion",
    }));

    setSelectedCustomer(null);

    setActiveSection("notifications");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // SETTINGS SAVE
  // =====================================================

  const saveSettings = () => {
    localStorage.setItem("shopsphere_admin_settings", JSON.stringify(settings));

    setSettingsSaved(true);

    setTimeout(() => {
      setSettingsSaved(false);
    }, 2500);
  };

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = useMemo(() => {
    const search = productSearch.toLowerCase().trim();

    const lowLimit = Number(settings.lowStockLimit || 10);

    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name?.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search) ||
        product.category_name?.toLowerCase().includes(search);

      const matchesCategory =
        categoryFilter === "all" ||
        String(product.category_id) === String(categoryFilter);

      const stock = Number(product.stock || 0);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "available" && stock > 0) ||
        (stockFilter === "low" && stock > 0 && stock < lowLimit) ||
        (stockFilter === "out" && stock === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [
    products,
    productSearch,
    categoryFilter,
    stockFilter,
    settings.lowStockLimit,
  ]);

  // =====================================================
  // FILTER ORDERS
  // =====================================================

  const filteredOrders = useMemo(() => {
    const search = orderSearch.toLowerCase().trim();

    return orders.filter((order) => {
      const matchesSearch =
        !search ||
        String(order.id).toLowerCase().includes(search) ||
        order.user_name?.toLowerCase().includes(search) ||
        order.email?.toLowerCase().includes(search) ||
        order.phone?.toLowerCase().includes(search);

      const matchesStatus =
        orderStatusFilter === "all" || order.status === orderStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // =====================================================
  // FILTER CUSTOMERS
  // =====================================================

  const filteredCustomers = useMemo(() => {
    const search = customerSearch.toLowerCase().trim();

    return customers.filter(
      (customer) =>
        !search ||
        customer.name?.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search),
    );
  }, [customers, customerSearch]);

  // =====================================================
  // FILTER ADMINS
  // =====================================================

  const filteredAdmins = useMemo(() => {
    const search = adminSearch.toLowerCase().trim();

    return admins.filter(
      (account) =>
        !search ||
        account.name?.toLowerCase().includes(search) ||
        account.email?.toLowerCase().includes(search),
    );
  }, [admins, adminSearch]);

  // =====================================================
  // FILTER COUPONS
  // =====================================================

  const filteredCoupons = useMemo(() => {
    const search = couponSearch.toLowerCase().trim();

    return coupons.filter(
      (coupon) => !search || coupon.code?.toLowerCase().includes(search),
    );
  }, [coupons, couponSearch]);

  // =====================================================
  // FILTER NOTIFICATIONS
  // =====================================================

  const filteredNotifications = useMemo(() => {
    const search = notificationSearch.toLowerCase().trim();

    return notifications.filter((notification) => {
      const matchesSearch =
        !search ||
        String(notification.id).toLowerCase().includes(search) ||
        notification.user_name?.toLowerCase().includes(search) ||
        notification.user_email?.toLowerCase().includes(search) ||
        notification.title?.toLowerCase().includes(search) ||
        notification.message?.toLowerCase().includes(search);

      const matchesType =
        notificationTypeFilter === "all" ||
        notification.type === notificationTypeFilter;

      const matchesRead =
        notificationReadFilter === "all" ||
        (notificationReadFilter === "read" &&
          Number(notification.is_read) === 1) ||
        (notificationReadFilter === "unread" &&
          Number(notification.is_read) === 0);

      return matchesSearch && matchesType && matchesRead;
    });
  }, [
    notifications,
    notificationSearch,
    notificationTypeFilter,
    notificationReadFilter,
  ]);

  // =====================================================
  // INVENTORY
  // =====================================================

  const availableProducts = products.filter(
    (product) => Number(product.stock || 0) > 0,
  );

  const lowStockProducts = products.filter((product) => {
    const stock = Number(product.stock || 0);

    return stock > 0 && stock < Number(settings.lowStockLimit || 10);
  });

  const outOfStockProducts = products.filter(
    (product) => Number(product.stock || 0) === 0,
  );

  const totalStockUnits = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0,
  );

  const totalInventoryValue = products.reduce(
    (total, product) =>
      total + Number(product.price || 0) * Number(product.stock || 0),
    0,
  );

  // =====================================================
  // CUSTOMER METRICS
  // =====================================================

  const activeCustomers = customers.filter(
    (customer) => Number(customer.total_orders || 0) > 0,
  ).length;

  const customerRevenue = customers.reduce(
    (sum, customer) => sum + Number(customer.total_spent || 0),
    0,
  );

  // =====================================================
  // SALES
  // =====================================================

  const salesByStatus = {
    paid: orders
      .filter((order) => order.status === "paid")
      .reduce((sum, order) => sum + Number(order.total_price || 0), 0),

    processing: orders
      .filter((order) => order.status === "processing")
      .reduce((sum, order) => sum + Number(order.total_price || 0), 0),

    shipped: orders
      .filter((order) => order.status === "shipped")
      .reduce((sum, order) => sum + Number(order.total_price || 0), 0),

    completed: orders
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + Number(order.total_price || 0), 0),
  };

  const salesTotal = Number(stats.totalSales || 0);

  const salesPercentage = (value) => {
    if (salesTotal <= 0) {
      return 0;
    }

    return Math.min((value / salesTotal) * 100, 100);
  };

  // =====================================================
  // COUPON METRICS
  // =====================================================

  const activeCoupons = coupons.filter(
    (coupon) =>
      Number(coupon.is_active) === 1 &&
      !(coupon.expires_at && new Date(coupon.expires_at) < new Date()),
  );

  const expiredCoupons = coupons.filter(
    (coupon) => coupon.expires_at && new Date(coupon.expires_at) < new Date(),
  );

  // =====================================================
  // NOTIFICATION METRICS
  // =====================================================

  const unreadNotifications = notifications.filter(
    (notification) => Number(notification.is_read) === 0,
  ).length;

  const readNotifications = notifications.filter(
    (notification) => Number(notification.is_read) === 1,
  ).length;

  const promotionNotifications = notifications.filter(
    (notification) => notification.type === "promotion",
  ).length;

  const orderNotifications = notifications.filter(
    (notification) => notification.type === "order_status",
  ).length;

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "processing":
        return "bg-blue-100 text-blue-700";

      case "shipped":
        return "bg-purple-100 text-purple-700";

      case "completed":
        return "bg-emerald-100 text-emerald-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // =====================================================
  // NOTIFICATION TYPE ICON
  // =====================================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "promotion":
        return "🎟️";

      case "payment":
        return "💳";

      case "order_status":
        return "📦";

      case "system":
        return "⚙️";

      default:
        return "🔔";
    }
  };

  // =====================================================
  // NAV CLASS
  // =====================================================

  const navItemClass = (section) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${
      activeSection === section
        ? "bg-blue-600 text-white shadow"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl animate-pulse">🛍️</div>

          <h1 className="text-3xl font-black mt-5">
            Loading ShopSphere Admin...
          </h1>

          <p className="text-slate-500 mt-2">Please wait.</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-100">
      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-slate-950 z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* LOGO */}

          <div className="px-6 py-6 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white">
                  🛍️ ShopSphere
                </h1>

                <p className="text-xs text-slate-400 mt-1">
                  Admin Control Center
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-400 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* PROFILE */}

          <div className="px-5 py-5 border-b border-slate-800">
            <div className="bg-slate-900 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                {/* PROFILE PHOTO UPLOAD */}

                <label className="relative w-11 h-11 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-xl cursor-pointer group shrink-0">
                  {profilePhotoPreview || adminUser?.profile_image ? (
                    <img
                      src={
                        profilePhotoPreview ||
                        getProfileImageUrl(adminUser.profile_image)
                      }
                      alt="Admin Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>👤</span>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleProfilePhotoChange}
                    disabled={profilePhotoSaving}
                    className="hidden"
                  />

                  <span className="absolute inset-0 bg-black/60 text-white text-[9px] font-black items-center justify-center hidden group-hover:flex">
                    {profilePhotoSaving ? "..." : "EDIT"}
                  </span>
                </label>

                <div className="min-w-0">
                  <p className="text-white font-black truncate">
                    {adminUser?.name || "Administrator"}
                  </p>

                  <p className="text-xs text-slate-400 truncate">
                    {adminUser?.email || "Admin Account"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-emerald-400 font-bold mt-3">
                ● Administrator
              </p>

              <p className="text-[10px] text-slate-500 mt-2">
                Click your photo to upload a new profile picture.
              </p>
            </div>
          </div>

          {/* NAVIGATION */}

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <button
              type="button"
              onClick={() => changeSection("overview")}
              className={navItemClass("overview")}
            >
              📊 Overview
            </button>

            {/* STORE */}

            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-black px-4 pt-4">
              Store
            </p>

            <button
              type="button"
              onClick={() => changeSection("products")}
              className={navItemClass("products")}
            >
              📦 Products
              <span className="ml-auto bg-slate-800 px-2 py-1 rounded-full text-xs">
                {products.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowCategoryPanel((previous) => !previous)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              🏷️ Categories
              <span className="ml-auto bg-slate-800 px-2 py-1 rounded-full text-xs">
                {categories.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => changeSection("inventory")}
              className={navItemClass("inventory")}
            >
              📋 Inventory
              <span className="ml-auto bg-slate-800 px-2 py-1 rounded-full text-xs">
                {lowStockProducts.length + outOfStockProducts.length}
              </span>
            </button>

            {/* SALES */}

            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-black px-4 pt-4">
              Sales
            </p>

            <button
              type="button"
              onClick={() => changeSection("orders")}
              className={navItemClass("orders")}
            >
              🧾 Orders
              <span className="ml-auto bg-slate-800 px-2 py-1 rounded-full text-xs">
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => changeSection("customers")}
              className={navItemClass("customers")}
            >
              👥 Customers
              <span className="ml-auto bg-slate-800 px-2 py-1 rounded-full text-xs">
                {customers.length}
              </span>
            </button>

            {/* ANALYTICS */}

            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-black px-4 pt-4">
              Analytics
            </p>

            <button
              type="button"
              onClick={() => changeSection("sales")}
              className={navItemClass("sales")}
            >
              📈 Analytics
            </button>

            {/* COMMUNICATION */}

            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-black px-4 pt-4">
              Communication
            </p>

            <button
              type="button"
              onClick={() => changeSection("notifications")}
              className={navItemClass("notifications")}
            >
              <span>🔔</span>

              <span>Notifications</span>

              <span
                className={`ml-auto px-2 py-1 rounded-full text-xs font-black ${
                  unreadNotifications > 0
                    ? "bg-red-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            </button>

            {/* SYSTEM */}

            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-black px-4 pt-4">
              System
            </p>

            <button
              type="button"
              onClick={() => changeSection("admins")}
              className={navItemClass("admins")}
            >
              👤 Admins
              <span className="ml-auto bg-slate-800 px-2 py-1 rounded-full text-xs">
                {admins.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => changeSection("coupons")}
              className={navItemClass("coupons")}
            >
              🎟️ Coupons
              <span className="ml-auto bg-slate-800 px-2 py-1 rounded-full text-xs">
                {coupons.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => changeSection("settings")}
              className={navItemClass("settings")}
            >
              ⚙️ Settings
            </button>
          </nav>

          {/* FOOTER */}

          <div className="p-4 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full text-left px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white font-bold"
            >
              🏠 View Store
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="lg:ml-72 min-h-screen">
        {/* TOP BAR */}

        <header className="bg-white border-b sticky top-0 z-30">
          <div className="h-20 px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-11 h-11 rounded-xl bg-slate-950 text-white"
              >
                ☰
              </button>

              <div>
                <p className="text-xs uppercase text-blue-600 font-black">
                  ShopSphere Admin
                </p>

                <h2 className="text-xl md:text-2xl font-black">
                  {activeSection === "overview" && "Dashboard Overview"}

                  {activeSection === "products" && "Product Management"}

                  {activeSection === "inventory" && "Inventory Management"}

                  {activeSection === "orders" && "Order Management"}

                  {activeSection === "customers" && "Customer Management"}

                  {activeSection === "sales" && "Sales Analytics"}

                  {activeSection === "admins" && "Admin Management"}

                  {activeSection === "coupons" && "Coupon Management"}

                  {activeSection === "notifications" &&
                    "Notification Management"}

                  {activeSection === "settings" && "Admin Settings"}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl font-bold"
            >
              {refreshing ? "⏳" : "🔄"}
            </button>
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="max-w-[1500px] mx-auto px-4 md:px-8 py-8">
          {/* PAGE HEADER */}

          <div className="flex flex-col xl:flex-row justify-between gap-5 mb-8">
            <div>
              <p className="text-blue-600 uppercase text-sm font-black">
                Administration
              </p>

              <h1 className="text-3xl md:text-4xl font-black">
                ShopSphere Dashboard
              </h1>

              <p className="text-slate-500 mt-2">
                Manage products, inventory, orders, customers, admins, coupons,
                notifications and settings.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white border px-5 py-3 rounded-xl font-bold"
              >
                {refreshing ? "Refreshing..." : "🔄 Refresh"}
              </button>

              <button
                type="button"
                onClick={openAddProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold"
              >
                ＋ Add Product
              </button>
            </div>
          </div>

          {/* STATS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-blue-600">
              <p className="text-slate-500 font-bold">Total Products</p>

              <p className="text-4xl font-black text-blue-600 mt-2">
                {stats.totalProducts}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-purple-600">
              <p className="text-slate-500 font-bold">Total Orders</p>

              <p className="text-4xl font-black text-purple-600 mt-2">
                {stats.totalOrders}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-orange-500">
              <p className="text-slate-500 font-bold">Total Users</p>

              <p className="text-4xl font-black text-orange-500 mt-2">
                {stats.totalUsers}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-green-600">
              <p className="text-slate-500 font-bold">Total Sales</p>

              <p className="text-3xl font-black text-green-600 mt-3">
                {money(stats.totalSales)}
              </p>
            </div>
          </div>

          {/* =================================================
              OVERVIEW
          ================================================= */}

          {activeSection === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
                <button
                  type="button"
                  onClick={openAddProduct}
                  className="bg-blue-600 text-white rounded-2xl p-6 text-left"
                >
                  <div className="text-3xl mb-4">＋</div>

                  <h3 className="text-xl font-black">Add Product</h3>

                  <p className="text-blue-100 mt-2">Create new product.</p>
                </button>

                <button
                  type="button"
                  onClick={() => changeSection("inventory")}
                  className="bg-white rounded-2xl p-6 text-left shadow-sm"
                >
                  <div className="text-3xl mb-4">📋</div>

                  <h3 className="text-xl font-black">Inventory</h3>

                  <p className="text-slate-500 mt-2">Monitor stock.</p>
                </button>

                <button
                  type="button"
                  onClick={() => changeSection("orders")}
                  className="bg-white rounded-2xl p-6 text-left shadow-sm"
                >
                  <div className="text-3xl mb-4">🧾</div>

                  <h3 className="text-xl font-black">Orders</h3>

                  <p className="text-slate-500 mt-2">Manage orders.</p>
                </button>

                <button
                  type="button"
                  onClick={() => changeSection("coupons")}
                  className="bg-white rounded-2xl p-6 text-left shadow-sm"
                >
                  <div className="text-3xl mb-4">🎟️</div>

                  <h3 className="text-xl font-black">Coupons</h3>

                  <p className="text-slate-500 mt-2">Manage promotions.</p>
                </button>

                <button
                  type="button"
                  onClick={() => changeSection("notifications")}
                  className="bg-white rounded-2xl p-6 text-left shadow-sm"
                >
                  <div className="text-3xl mb-4">🔔</div>

                  <h3 className="text-xl font-black">Notifications</h3>

                  <p className="text-slate-500 mt-2">
                    Communicate with customers.
                  </p>

                  <p className="text-red-600 font-black mt-4">
                    {unreadNotifications} unread
                  </p>
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b flex justify-between">
                    <div>
                      <h3 className="text-xl font-black">⚠️ Low Stock</h3>

                      <p className="text-slate-500 text-sm mt-1">
                        Products needing restock.
                      </p>
                    </div>

                    <span className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-full font-black">
                      {lowStockProducts.length}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    {lowStockProducts.slice(0, 6).map((product) => (
                      <div
                        key={product.id}
                        className="flex justify-between bg-yellow-50 p-4 rounded-xl"
                      >
                        <span className="font-black">{product.name}</span>

                        <span className="text-yellow-700 font-black">
                          {product.stock} left
                        </span>
                      </div>
                    ))}

                    {lowStockProducts.length === 0 && (
                      <p className="text-center text-slate-500 p-8">
                        ✅ No low-stock products.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b flex justify-between">
                    <div>
                      <h3 className="text-xl font-black">🧾 Recent Orders</h3>

                      <p className="text-slate-500 text-sm mt-1">
                        Latest customer activity.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => changeSection("orders")}
                      className="text-blue-600 font-bold"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="p-4 text-left">Order</th>

                          <th className="p-4 text-left">Customer</th>

                          <th className="p-4 text-left">Total</th>

                          <th className="p-4 text-left">Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="border-t">
                            <td className="p-4 font-black">#{order.id}</td>

                            <td className="p-4 font-bold">
                              {order.user_name ||
                                `${order.first_name || ""} ${
                                  order.last_name || ""
                                }`.trim() ||
                                "Unknown"}
                            </td>

                            <td className="p-4 text-green-600 font-black">
                              {money(order.total_price)}
                            </td>

                            <td className="p-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-black ${getStatusClass(
                                  order.status,
                                )}`}
                              >
                                {order.status || "pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              PRODUCT FORM
          ================================================= */}

          {showForm && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex justify-between mb-6">
                <div>
                  <p className="text-blue-600 uppercase text-xs font-black">
                    Product Management
                  </p>

                  <h2 className="text-2xl font-black">
                    {editingProduct ? "✏️ Edit Product" : "➕ Add Product"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={resetProductForm}
                  className="text-red-600 font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                <div>
                  <label className="block font-bold mb-2">Category *</label>

                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    className="w-full border p-3 rounded-xl"
                  >
                    <option value="">Select Category</option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-2">Product Name *</label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border p-3 rounded-xl"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold mb-2">Description</label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border p-3 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Price</label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full border p-3 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Stock</label>

                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full border p-3 rounded-xl"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block font-bold mb-2">
                        Product Image 1
                      </label>

                      <input
                        type="file"
                        name="image"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(event) => handleImageChange(event, "image")}
                        className="w-full border p-3 rounded-xl"
                      />

                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Product Image 1 preview"
                          className="mt-3 w-full h-48 rounded-2xl object-cover border"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block font-bold mb-2">
                        Product Image 2
                      </label>

                      <input
                        type="file"
                        name="image2"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(event) => handleImageChange(event, "image2")}
                        className="w-full border p-3 rounded-xl"
                      />

                      {image2Preview && (
                        <img
                          src={image2Preview}
                          alt="Product Image 2 preview"
                          className="mt-3 w-full h-48 rounded-2xl object-cover border"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block font-bold mb-2">
                        Product Image 3
                      </label>

                      <input
                        type="file"
                        name="image3"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(event) => handleImageChange(event, "image3")}
                        className="w-full border p-3 rounded-xl"
                      />

                      {image3Preview && (
                        <img
                          src={image3Preview}
                          alt="Product Image 3 preview"
                          className="mt-3 w-full h-48 rounded-2xl object-cover border"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingProduct
                        ? "💾 Update Product"
                        : "＋ Create Product"}
                  </button>

                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="bg-slate-700 text-white px-8 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =================================================
              PRODUCTS
          ================================================= */}

          {activeSection === "products" && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="🔎 Search products..."
                    className="border p-3 rounded-xl"
                  />

                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="border p-3 rounded-xl"
                  >
                    <option value="all">All Categories</option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={stockFilter}
                    onChange={(event) => setStockFilter(event.target.value)}
                    className="border p-3 rounded-xl"
                  >
                    <option value="all">All Stock</option>

                    <option value="available">Available</option>

                    <option value="low">Low Stock</option>

                    <option value="out">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-4 text-left">ID</th>

                      <th className="p-4 text-left">Image</th>

                      <th className="p-4 text-left">Product</th>

                      <th className="p-4 text-left">Category</th>

                      <th className="p-4 text-left">Price</th>

                      <th className="p-4 text-left">Stock</th>

                      <th className="p-4 text-left">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => {
                      const stock = Number(product.stock || 0);

                      return (
                        <tr
                          key={product.id}
                          className="border-t hover:bg-slate-50"
                        >
                          <td className="p-4 font-black">#{product.id}</td>

                          <td className="p-4">
                            <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden">
                              {product.image ? (
                                <img
                                  src={getImageUrl(product.image)}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  🖼️
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="p-4">
                            <p className="font-black">{product.name}</p>

                            <p className="text-xs text-slate-500 truncate max-w-xs">
                              {product.description}
                            </p>
                          </td>

                          <td className="p-4">
                            {product.category_name || "-"}
                          </td>

                          <td className="p-4 text-green-600 font-black">
                            {money(product.price)}
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full font-bold ${
                                stock === 0
                                  ? "bg-red-100 text-red-700"
                                  : stock < Number(settings.lowStockLimit || 10)
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {stock === 0 ? "Out" : stock}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => editProduct(product)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold"
                              >
                                ✏️ Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteProduct(product.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredProducts.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="p-12 text-center text-slate-500"
                        >
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================
              INVENTORY
          ================================================= */}

          {activeSection === "inventory" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-slate-500 font-bold">Total Units</p>

                  <p className="text-4xl font-black text-blue-600 mt-2">
                    {totalStockUnits}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-slate-500 font-bold">Available</p>

                  <p className="text-4xl font-black text-green-600 mt-2">
                    {availableProducts.length}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-slate-500 font-bold">Low Stock</p>

                  <p className="text-4xl font-black text-yellow-600 mt-2">
                    {lowStockProducts.length}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-slate-500 font-bold">Out of Stock</p>

                  <p className="text-4xl font-black text-red-600 mt-2">
                    {outOfStockProducts.length}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-6">
                <p className="text-slate-300">Inventory Value</p>

                <p className="text-4xl font-black mt-2">
                  {money(totalInventoryValue)}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-4 text-left">Product</th>

                        <th className="p-4 text-left">Category</th>

                        <th className="p-4 text-left">Stock</th>

                        <th className="p-4 text-left">Value</th>

                        <th className="p-4 text-left">Status</th>

                        <th className="p-4 text-left">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredProducts.map((product) => {
                        const stock = Number(product.stock || 0);

                        const value = stock * Number(product.price || 0);

                        const low =
                          stock > 0 &&
                          stock < Number(settings.lowStockLimit || 10);

                        return (
                          <tr key={product.id} className="border-t">
                            <td className="p-4 font-black">{product.name}</td>

                            <td className="p-4">
                              {product.category_name || "-"}
                            </td>

                            <td className="p-4 font-black">{stock}</td>

                            <td className="p-4 font-black">{money(value)}</td>

                            <td className="p-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-black ${
                                  stock === 0
                                    ? "bg-red-100 text-red-700"
                                    : low
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-700"
                                }`}
                              >
                                {stock === 0
                                  ? "Out of Stock"
                                  : low
                                    ? "Low Stock"
                                    : "In Stock"}
                              </span>
                            </td>

                            <td className="p-4">
                              <button
                                type="button"
                                onClick={() => editProduct(product)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
                              >
                                ✏️ Update
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              ORDERS
          ================================================= */}

          {activeSection === "orders" && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    value={orderSearch}
                    onChange={(event) => setOrderSearch(event.target.value)}
                    placeholder="🔎 Search orders..."
                    className="border p-3 rounded-xl"
                  />

                  <select
                    value={orderStatusFilter}
                    onChange={(event) =>
                      setOrderStatusFilter(event.target.value)
                    }
                    className="border p-3 rounded-xl"
                  >
                    <option value="all">All Status</option>

                    <option value="pending">Pending</option>

                    <option value="processing">Processing</option>

                    <option value="paid">Paid</option>

                    <option value="shipped">Shipped</option>

                    <option value="completed">Completed</option>

                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-4 text-left">ID</th>

                      <th className="p-4 text-left">Customer</th>

                      <th className="p-4 text-left">Phone</th>

                      <th className="p-4 text-left">Total</th>

                      <th className="p-4 text-left">Status</th>

                      <th className="p-4 text-left">Date</th>

                      <th className="p-4 text-left">Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-t">
                        <td className="p-4 font-black">#{order.id}</td>

                        <td className="p-4 font-bold">
                          {order.user_name ||
                            `${order.first_name || ""} ${
                              order.last_name || ""
                            }`.trim() ||
                            "Unknown"}
                        </td>

                        <td className="p-4">{order.phone || "-"}</td>

                        <td className="p-4 font-black text-green-600">
                          {money(order.total_price)}
                        </td>

                        <td className="p-4">
                          <select
                            value={order.status || "pending"}
                            onChange={(event) =>
                              updateOrderStatus(order.id, event.target.value)
                            }
                            className={`border rounded-lg px-3 py-2 font-bold ${getStatusClass(
                              order.status,
                            )}`}
                          >
                            <option value="pending">Pending</option>

                            <option value="processing">Processing</option>

                            <option value="paid">Paid</option>

                            <option value="shipped">Shipped</option>

                            <option value="completed">Completed</option>

                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="p-4 text-slate-500">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => viewOrderDetails(order.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
                          >
                            👁️ Details
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="p-12 text-center text-slate-500"
                        >
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================
              CUSTOMERS
          ================================================= */}

          {activeSection === "customers" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-slate-500 font-bold">Total Customers</p>

                  <p className="text-4xl font-black text-blue-600 mt-2">
                    {customers.length}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-slate-500 font-bold">Active Customers</p>

                  <p className="text-4xl font-black text-green-600 mt-2">
                    {activeCustomers}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-slate-500 font-bold">Customer Revenue</p>

                  <p className="text-3xl font-black text-purple-600 mt-3">
                    {money(customerRevenue)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b flex flex-col xl:flex-row justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">
                      👥 Customer Management
                    </h2>

                    <p className="text-slate-500 mt-1">Registered customers.</p>
                  </div>

                  <input
                    value={customerSearch}
                    onChange={(event) => setCustomerSearch(event.target.value)}
                    placeholder="🔎 Search customers..."
                    className="border p-3 rounded-xl w-full xl:w-80"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-4 text-left">ID</th>

                        <th className="p-4 text-left">Customer</th>

                        <th className="p-4 text-left">Email</th>

                        <th className="p-4 text-left">Orders</th>

                        <th className="p-4 text-left">Spent</th>

                        <th className="p-4 text-left">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="border-t">
                          <td className="p-4 font-black">#{customer.id}</td>

                          <td className="p-4 font-black">{customer.name}</td>

                          <td className="p-4">{customer.email}</td>

                          <td className="p-4 font-black">
                            {Number(customer.total_orders || 0)}
                          </td>

                          <td className="p-4 text-green-600 font-black">
                            {money(customer.total_spent)}
                          </td>

                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedCustomer(customer)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
                              >
                                👁️ View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openNotificationForCustomer(customer)
                                }
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold"
                              >
                                🔔 Notify
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleChangeUserRole(customer.id, "admin")
                                }
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold"
                              >
                                👤 Make Admin
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredCustomers.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="p-12 text-center text-slate-500"
                          >
                            No customers found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              ANALYTICS
          ================================================= */}

          {activeSection === "sales" && (
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 rounded-3xl p-7 md:p-9 text-white shadow-xl">
                <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
                  <div>
                    <p className="text-blue-300 uppercase tracking-[0.2em] text-xs font-black">
                      Sales Analytics
                    </p>

                    <h2 className="text-3xl md:text-4xl font-black mt-2">
                      📈 Store Performance
                    </h2>

                    <p className="text-slate-300 mt-3 max-w-2xl leading-7">
                      Revenue below includes paid, shipped and completed orders.
                      Pending orders are shown separately so your actual revenue
                      is never overstated.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/10 px-6 py-5 backdrop-blur">
                    <p className="text-xs uppercase tracking-widest text-slate-300 font-black">
                      Actual Revenue
                    </p>

                    <p className="text-3xl md:text-4xl font-black text-emerald-300 mt-1">
                      {money(salesTotal)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
                <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                    Actual Revenue
                  </p>

                  <p className="text-3xl font-black text-emerald-600 mt-2">
                    {money(salesTotal)}
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-amber-100 p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                    Pending Value
                  </p>

                  <p className="text-3xl font-black text-amber-600 mt-2">
                    {money(pendingValue)}
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-blue-100 p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                    Average Order
                  </p>

                  <p className="text-3xl font-black text-blue-600 mt-2">
                    {money(averageOrderValue)}
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-indigo-100 p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                    Completed Orders
                  </p>

                  <p className="text-3xl font-black text-indigo-600 mt-2">
                    {completedOrders.length}
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-red-100 p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-black">
                    Cancelled Orders
                  </p>

                  <p className="text-3xl font-black text-red-600 mt-2">
                    {cancelledOrders.length}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-blue-600 font-black">
                        Revenue Trend
                      </p>

                      <h3 className="text-2xl font-black mt-1">Last 7 Days</h3>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
                      💰
                    </div>
                  </div>

                  {overviewLoading ? (
                    <div className="h-72 flex items-center justify-center text-slate-400 font-bold">
                      ⏳ Loading revenue...
                    </div>
                  ) : (
                    <div className="mt-8">
                      <div className="h-56 flex items-end gap-3 sm:gap-5 border-b border-slate-200 pb-2">
                        {sevenDayRevenue.map((item) => {
                          const height =
                            item.value > 0
                              ? Math.max((item.value / maxRevenue) * 100, 8)
                              : 3;

                          return (
                            <div
                              key={item.date}
                              className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                            >
                              <div className="w-full flex-1 flex items-end justify-center">
                                <div
                                  title={`${formatAnalyticsDate(
                                    item.date,
                                  )}: ${money(item.value)}`}
                                  className={`w-full max-w-12 rounded-t-xl transition-all ${
                                    item.value > 0
                                      ? "bg-gradient-to-t from-blue-700 to-indigo-500"
                                      : "bg-slate-200"
                                  }`}
                                  style={{
                                    height: `${height}%`,
                                  }}
                                />
                              </div>

                              <span className="text-xs font-black text-slate-400">
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="text-sm text-slate-500">
                          Paid + shipped + completed orders
                        </p>

                        {sevenDayRevenue.every((item) => item.value === 0) && (
                          <p className="text-sm font-black text-amber-600">
                            No completed revenue in the last 7 days yet.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-7">
                  <p className="text-xs uppercase tracking-widest text-indigo-600 font-black">
                    Order Breakdown
                  </p>

                  <h3 className="text-2xl font-black mt-1">Status Summary</h3>

                  <div className="mt-6 space-y-3">
                    {[
                      ["pending", pendingOrders.length],
                      ["processing", processingOrders.length],
                      ["paid", paidOrders.length],
                      ["shipped", shippedOrders.length],
                      ["completed", completedOrders.length],
                      ["cancelled", cancelledOrders.length],
                    ].map(([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                      >
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black capitalize ${getStatusClass(
                            status,
                          )}`}
                        >
                          {status}
                        </span>

                        <span className="text-xl font-black">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-7">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-7">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-emerald-600 font-black">
                      Revenue Distribution
                    </p>

                    <h3 className="text-2xl font-black mt-1">
                      Sales by Status
                    </h3>
                  </div>

                  <p className="text-sm text-slate-500">
                    Revenue only counts paid, shipped and completed orders.
                  </p>
                </div>

                <div className="space-y-5">
                  {[
                    {
                      name: "Paid",
                      value: salesByStatus.paid,
                    },
                    {
                      name: "Processing",
                      value: salesByStatus.processing,
                    },
                    {
                      name: "Shipped",
                      value: salesByStatus.shipped,
                    },
                    {
                      name: "Completed",
                      value: salesByStatus.completed,
                    },
                  ].map((item) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="font-black">{item.name}</span>

                        <span className="font-black text-emerald-600">
                          {money(item.value)}
                        </span>
                      </div>

                      <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                          style={{
                            width: `${salesPercentage(item.value)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b">
                    <p className="text-xs uppercase tracking-widest text-amber-600 font-black">
                      Product Performance
                    </p>

                    <h3 className="text-2xl font-black mt-1">
                      🔥 Top Ordered Products
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      Includes non-cancelled orders, including pending orders.
                    </p>
                  </div>

                  <div className="p-5">
                    {overview.topProducts.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="text-4xl">📦</div>

                        <p className="font-black text-slate-700 mt-3">
                          No ordered products yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {overview.topProducts.map((product, index) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 hover:bg-slate-50 transition"
                          >
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                              #{index + 1}
                            </div>

                            <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                              {product.image ? (
                                <img
                                  src={getImageUrl(product.image)}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <span className="text-xl">📦</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-black truncate">
                                {product.name}
                              </p>

                              <p className="text-sm text-slate-500 mt-1">
                                {money(product.price)}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs uppercase text-slate-400 font-black">
                                Ordered
                              </p>

                              <p className="text-xl font-black text-amber-600">
                                {Number(product.total_sold || 0)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b">
                    <p className="text-xs uppercase tracking-widest text-red-600 font-black">
                      Inventory Alert
                    </p>

                    <h3 className="text-2xl font-black mt-1">
                      ⚠️ Low Stock Products
                    </h3>
                  </div>

                  <div className="p-5">
                    {overview.lowStockProducts.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="text-4xl">✅</div>

                        <p className="font-black text-emerald-700 mt-3">
                          Inventory looks healthy
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {overview.lowStockProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-4 rounded-2xl border border-red-100 bg-red-50/50 p-4"
                          >
                            <div className="w-12 h-12 rounded-xl bg-white border overflow-hidden flex items-center justify-center shrink-0">
                              {product.image ? (
                                <img
                                  src={getImageUrl(product.image)}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <span>📦</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-black truncate">
                                {product.name}
                              </p>

                              <p className="text-sm text-slate-500 mt-1">
                                {money(product.price)}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs uppercase text-red-500 font-black">
                                Stock
                              </p>

                              <p className="text-xl font-black text-red-600">
                                {Number(product.stock || 0)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {overviewError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-5 font-bold">
                  ⚠️ {overviewError}
                </div>
              )}
            </div>
          )}

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          {activeSection === "notifications" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-red-500">
                  <p className="text-slate-500 font-bold">Unread</p>

                  <p className="text-4xl font-black text-red-600 mt-2">
                    {unreadNotifications}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-green-500">
                  <p className="text-slate-500 font-bold">Read</p>

                  <p className="text-4xl font-black text-green-600 mt-2">
                    {readNotifications}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-purple-500">
                  <p className="text-slate-500 font-bold">Promotions</p>

                  <p className="text-4xl font-black text-purple-600 mt-2">
                    {promotionNotifications}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-blue-500">
                  <p className="text-slate-500 font-bold">Order Alerts</p>

                  <p className="text-4xl font-black text-blue-600 mt-2">
                    {orderNotifications}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="mb-6">
                  <p className="text-indigo-600 uppercase text-xs font-black">
                    Communication
                  </p>

                  <h2 className="text-2xl font-black mt-1">
                    🔔 Notification Center
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Send a notification to one customer or broadcast it to
                    everyone.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-2">
                      Customer
                    </label>

                    <select
                      name="user_id"
                      value={notificationForm.user_id}
                      onChange={handleNotificationChange}
                      className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Customer</option>

                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} — {customer.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-2">
                      Type
                    </label>

                    <select
                      name="type"
                      value={notificationForm.type}
                      onChange={handleNotificationChange}
                      className="w-full border p-3 rounded-xl"
                    >
                      <option value="promotion">🎟️ Promotion</option>

                      <option value="payment">💳 Payment</option>

                      <option value="order_status">📦 Order</option>

                      <option value="system">⚙️ System</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-2">
                      Title *
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={notificationForm.title}
                      onChange={handleNotificationChange}
                      maxLength="150"
                      placeholder="🎉 Special Offer"
                      className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-2">
                      Message *
                    </label>

                    <textarea
                      name="message"
                      value={notificationForm.message}
                      onChange={handleNotificationChange}
                      rows="5"
                      placeholder="Get 20% off selected products this weekend!"
                      className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => sendNotification(false)}
                    disabled={notificationSending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black disabled:opacity-50"
                  >
                    {notificationSending ? "Sending..." : "📨 Send to Customer"}
                  </button>

                  <button
                    type="button"
                    onClick={() => sendNotification(true)}
                    disabled={notificationSending}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-black disabled:opacity-50"
                  >
                    {notificationSending
                      ? "Sending..."
                      : "📢 Send to All Users"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setNotificationForm({
                        ...emptyNotificationForm,
                      })
                    }
                    className="bg-slate-200 px-6 py-3 rounded-xl font-bold"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex flex-col xl:flex-row justify-between gap-5">
                    <div>
                      <h2 className="text-2xl font-black">
                        🔔 Notification History
                      </h2>

                      <p className="text-slate-500 mt-1">
                        {filteredNotifications.length} of {notifications.length}{" "}
                        notifications.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={loadNotifications}
                      disabled={notificationLoading}
                      className="bg-slate-100 hover:bg-slate-200 px-5 py-3 rounded-xl font-bold"
                    >
                      {notificationLoading ? "⏳ Loading..." : "🔄 Refresh"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                    <input
                      type="text"
                      value={notificationSearch}
                      onChange={(event) =>
                        setNotificationSearch(event.target.value)
                      }
                      placeholder="🔎 Search notifications..."
                      className="border p-3 rounded-xl"
                    />

                    <select
                      value={notificationTypeFilter}
                      onChange={(event) =>
                        setNotificationTypeFilter(event.target.value)
                      }
                      className="border p-3 rounded-xl"
                    >
                      <option value="all">All Types</option>

                      <option value="promotion">Promotion</option>

                      <option value="payment">Payment</option>

                      <option value="order_status">Order</option>

                      <option value="system">System</option>
                    </select>

                    <select
                      value={notificationReadFilter}
                      onChange={(event) =>
                        setNotificationReadFilter(event.target.value)
                      }
                      className="border p-3 rounded-xl"
                    >
                      <option value="all">All Read Status</option>

                      <option value="unread">Unread</option>

                      <option value="read">Read</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-4 text-left">ID</th>

                        <th className="p-4 text-left">Customer</th>

                        <th className="p-4 text-left">Notification</th>

                        <th className="p-4 text-left">Type</th>

                        <th className="p-4 text-left">Status</th>

                        <th className="p-4 text-left">Date</th>

                        <th className="p-4 text-left">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {notificationLoading ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="p-12 text-center text-slate-500"
                          >
                            ⏳ Loading notifications...
                          </td>
                        </tr>
                      ) : filteredNotifications.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="p-12 text-center text-slate-500"
                          >
                            No notifications found.
                          </td>
                        </tr>
                      ) : (
                        filteredNotifications.map((notification) => (
                          <tr
                            key={notification.id}
                            className="border-t hover:bg-slate-50"
                          >
                            <td className="p-4 font-black">
                              #{notification.id}
                            </td>

                            <td className="p-4">
                              <p className="font-black">
                                {notification.user_name || "Unknown"}
                              </p>

                              <p className="text-xs text-slate-500">
                                {notification.user_email || "-"}
                              </p>
                            </td>

                            <td className="p-4 max-w-md">
                              <div className="flex gap-3">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center">
                                  {getNotificationIcon(notification.type)}
                                </div>

                                <div>
                                  <p className="font-black text-slate-800">
                                    {notification.title}
                                  </p>

                                  <p className="text-sm text-slate-500 mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
                                {notification.type || "system"}
                              </span>
                            </td>

                            <td className="p-4">
                              {Number(notification.is_read) === 1 ? (
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                                  ✓ Read
                                </span>
                              ) : (
                                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-black">
                                  ● Unread
                                </span>
                              )}
                            </td>

                            <td className="p-4 text-sm text-slate-500">
                              {notification.created_at
                                ? new Date(
                                    notification.created_at,
                                  ).toLocaleString()
                                : "-"}
                            </td>

                            <td className="p-4">
                              <button
                                type="button"
                                onClick={() =>
                                  deleteAdminNotification(notification.id)
                                }
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              ADMINS
          ================================================= */}

          {activeSection === "admins" && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-col xl:flex-row justify-between gap-5">
                  <div>
                    <p className="text-blue-600 uppercase text-xs font-black">
                      System
                    </p>

                    <h2 className="text-2xl font-black">👤 Admin Management</h2>

                    <p className="text-slate-500 mt-1">
                      Manage administrators securely.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAdminForm((previous) => !previous)}
                    className="self-start bg-blue-600 text-white px-5 py-3 rounded-xl font-black"
                  >
                    {showAdminForm ? "✕ Close" : "＋ Create Admin"}
                  </button>
                </div>
              </div>

              {showAdminForm && (
                <form
                  onSubmit={handleCreateAdmin}
                  className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
                >
                  <h3 className="text-xl font-black">
                    ➕ Create New Administrator
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                    <input
                      value={adminForm.name}
                      onChange={(event) =>
                        setAdminForm((previous) => ({
                          ...previous,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Admin name"
                      className="border p-3 rounded-xl"
                    />

                    <input
                      type="email"
                      value={adminForm.email}
                      onChange={(event) =>
                        setAdminForm((previous) => ({
                          ...previous,
                          email: event.target.value,
                        }))
                      }
                      placeholder="Admin email"
                      className="border p-3 rounded-xl"
                    />

                    <input
                      type="password"
                      value={adminForm.password}
                      onChange={(event) =>
                        setAdminForm((previous) => ({
                          ...previous,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Password"
                      className="border p-3 rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={adminSaving}
                    className="mt-5 bg-green-600 text-white px-7 py-3 rounded-xl font-black"
                  >
                    {adminSaving ? "Creating..." : "✅ Create Administrator"}
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-slate-500 font-bold">Total Admins</p>

                  <p className="text-4xl font-black text-blue-600 mt-2">
                    {admins.length}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-slate-500 font-bold">Current Admin</p>

                  <p className="text-xl font-black text-green-600 mt-3">
                    {adminUser?.name || "Administrator"}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-slate-500 font-bold">Access</p>

                  <p className="text-xl font-black text-purple-600 mt-3">
                    Protected
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <input
                  value={adminSearch}
                  onChange={(event) => setAdminSearch(event.target.value)}
                  placeholder="🔎 Search admins..."
                  className="w-full md:w-96 border p-3 rounded-xl"
                />
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-4 text-left">ID</th>

                        <th className="p-4 text-left">Admin</th>

                        <th className="p-4 text-left">Email</th>

                        <th className="p-4 text-left">Role</th>

                        <th className="p-4 text-left">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredAdmins.map((account) => (
                        <tr key={account.id} className="border-t">
                          <td className="p-4 font-black">#{account.id}</td>

                          <td className="p-4 font-black">{account.name}</td>

                          <td className="p-4">{account.email}</td>

                          <td className="p-4">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-black">
                              {account.role}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedAdmin(account)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
                              >
                                👁️ View
                              </button>

                              <button
                                type="button"
                                disabled={
                                  Number(account.id) === Number(adminUser?.id)
                                }
                                onClick={() =>
                                  handleChangeUserRole(account.id, "customer")
                                }
                                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-40"
                              >
                                ↓ Make User
                              </button>

                              <button
                                type="button"
                                disabled={
                                  Number(account.id) === Number(adminUser?.id)
                                }
                                onClick={() => handleDeleteAdmin(account.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-40"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              COUPONS
          ================================================= */}

          {activeSection === "coupons" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-purple-600">
                  <p className="text-slate-500 font-bold">Total Coupons</p>

                  <p className="text-4xl font-black text-purple-600 mt-2">
                    {coupons.length}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-green-600">
                  <p className="text-slate-500 font-bold">Active</p>

                  <p className="text-4xl font-black text-green-600 mt-2">
                    {activeCoupons.length}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-red-600">
                  <p className="text-slate-500 font-bold">Expired</p>

                  <p className="text-4xl font-black text-red-600 mt-2">
                    {expiredCoupons.length}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-col xl:flex-row justify-between gap-4">
                  <div>
                    <p className="text-purple-600 uppercase text-xs font-black">
                      Marketing
                    </p>

                    <h2 className="text-2xl font-black">
                      🎟️ Coupon Management
                    </h2>

                    <p className="text-slate-500 mt-1">
                      Create and manage store promotions.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openAddCoupon}
                    className="self-start bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-black"
                  >
                    ＋ Create Coupon
                  </button>
                </div>
              </div>

              {showCouponForm && (
                <form
                  onSubmit={handleCouponSubmit}
                  className="bg-purple-50 border border-purple-200 rounded-2xl p-6"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xl font-black">
                        {editingCoupon ? "✏️ Edit Coupon" : "➕ Create Coupon"}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        Configure discount rules.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={resetCouponForm}
                      className="text-red-600 font-bold"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
                    <div>
                      <label className="block font-bold mb-2">
                        Coupon Code *
                      </label>

                      <input
                        name="code"
                        value={couponForm.code}
                        onChange={handleCouponChange}
                        placeholder="WELCOME10"
                        required
                        className="w-full border p-3 rounded-xl uppercase font-black"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-2">
                        Discount Type
                      </label>

                      <select
                        name="discount_type"
                        value={couponForm.discount_type}
                        onChange={handleCouponChange}
                        className="w-full border p-3 rounded-xl"
                      >
                        <option value="percentage">Percentage (%)</option>

                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-2">
                        Discount Value
                      </label>

                      <input
                        type="number"
                        name="discount_value"
                        value={couponForm.discount_value}
                        onChange={handleCouponChange}
                        min="0.01"
                        step="0.01"
                        required
                        className="w-full border p-3 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-2">
                        Minimum Order
                      </label>

                      <input
                        type="number"
                        name="minimum_order"
                        value={couponForm.minimum_order}
                        onChange={handleCouponChange}
                        min="0"
                        step="0.01"
                        className="w-full border p-3 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-2">
                        Usage Limit
                      </label>

                      <input
                        type="number"
                        name="usage_limit"
                        value={couponForm.usage_limit}
                        onChange={handleCouponChange}
                        min="1"
                        placeholder="Unlimited"
                        className="w-full border p-3 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-2">Expiry</label>

                      <input
                        type="datetime-local"
                        name="expires_at"
                        value={couponForm.expires_at}
                        onChange={handleCouponChange}
                        className="w-full border p-3 rounded-xl"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 bg-white p-4 rounded-xl border mt-5">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={Number(couponForm.is_active) === 1}
                      onChange={handleCouponChange}
                      className="w-5 h-5"
                    />

                    <div>
                      <p className="font-black">Active Coupon</p>

                      <p className="text-sm text-slate-500">
                        Customers can use it.
                      </p>
                    </div>
                  </label>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      type="submit"
                      disabled={couponSaving}
                      className="bg-green-600 text-white px-7 py-3 rounded-xl font-black disabled:opacity-50"
                    >
                      {couponSaving
                        ? "Saving..."
                        : editingCoupon
                          ? "💾 Update Coupon"
                          : "✅ Create Coupon"}
                    </button>

                    <button
                      type="button"
                      onClick={resetCouponForm}
                      className="bg-slate-700 text-white px-7 py-3 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <input
                  value={couponSearch}
                  onChange={(event) => setCouponSearch(event.target.value)}
                  placeholder="🔎 Search coupon..."
                  className="w-full md:w-96 border p-3 rounded-xl uppercase"
                />
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-4 text-left">ID</th>

                        <th className="p-4 text-left">Code</th>

                        <th className="p-4 text-left">Discount</th>

                        <th className="p-4 text-left">Minimum</th>

                        <th className="p-4 text-left">Usage</th>

                        <th className="p-4 text-left">Expiry</th>

                        <th className="p-4 text-left">Status</th>

                        <th className="p-4 text-left">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCoupons.map((coupon) => {
                        const expired =
                          coupon.expires_at &&
                          new Date(coupon.expires_at) < new Date();

                        const usageReached =
                          coupon.usage_limit !== null &&
                          Number(coupon.used_count || 0) >=
                            Number(coupon.usage_limit);

                        return (
                          <tr
                            key={coupon.id}
                            className="border-t hover:bg-slate-50"
                          >
                            <td className="p-4 font-black">#{coupon.id}</td>

                            <td className="p-4">
                              <span className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg font-black">
                                {coupon.code}
                              </span>
                            </td>

                            <td className="p-4 text-green-600 font-black">
                              {coupon.discount_type === "percentage"
                                ? `${Number(coupon.discount_value)}%`
                                : money(coupon.discount_value)}
                            </td>

                            <td className="p-4">
                              {money(coupon.minimum_order)}
                            </td>

                            <td className="p-4 font-bold">
                              {coupon.usage_limit === null
                                ? `${Number(coupon.used_count || 0)} / ∞`
                                : `${Number(coupon.used_count || 0)} / ${Number(
                                    coupon.usage_limit,
                                  )}`}
                            </td>

                            <td className="p-4 text-sm text-slate-500">
                              {coupon.expires_at
                                ? new Date(coupon.expires_at).toLocaleString()
                                : "No expiry"}
                            </td>

                            <td className="p-4">
                              {expired ? (
                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black">
                                  Expired
                                </span>
                              ) : usageReached ? (
                                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black">
                                  Limit Reached
                                </span>
                              ) : Number(coupon.is_active) === 1 ? (
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                                  Active
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black">
                                  Inactive
                                </span>
                              )}
                            </td>

                            <td className="p-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => editCoupon(coupon)}
                                  className="bg-yellow-500 text-white px-3 py-2 rounded-lg font-bold"
                                >
                                  ✏️ Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => deleteCoupon(coupon.id)}
                                  className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredCoupons.length === 0 && (
                        <tr>
                          <td
                            colSpan="8"
                            className="p-12 text-center text-slate-500"
                          >
                            No coupons found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              SETTINGS
          ================================================= */}

          {activeSection === "settings" && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-blue-600 uppercase text-xs font-black">
                  Administration
                </p>

                <h2 className="text-2xl font-black mt-1">⚙️ Settings</h2>

                <p className="text-slate-500 mt-2">Configure ShopSphere.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-black">🏪 Store Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                  <input
                    value={settings.storeName}
                    onChange={(event) =>
                      setSettings((previous) => ({
                        ...previous,
                        storeName: event.target.value,
                      }))
                    }
                    placeholder="Store name"
                    className="border p-3 rounded-xl"
                  />

                  <input
                    type="email"
                    value={settings.storeEmail}
                    onChange={(event) =>
                      setSettings((previous) => ({
                        ...previous,
                        storeEmail: event.target.value,
                      }))
                    }
                    placeholder="Store email"
                    className="border p-3 rounded-xl"
                  />

                  <input
                    value={settings.storePhone}
                    onChange={(event) =>
                      setSettings((previous) => ({
                        ...previous,
                        storePhone: event.target.value,
                      }))
                    }
                    placeholder="Store phone"
                    className="border p-3 rounded-xl"
                  />

                  <select
                    value={settings.currency}
                    onChange={(event) =>
                      setSettings((previous) => ({
                        ...previous,
                        currency: event.target.value,
                      }))
                    }
                    className="border p-3 rounded-xl"
                  >
                    <option value="USD">USD ($)</option>

                    <option value="ETB">ETB (Br)</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-black">📦 Inventory Settings</h3>

                <div className="max-w-md mt-6">
                  <label className="block font-bold mb-2">
                    Low Stock Limit
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={settings.lowStockLimit}
                    onChange={(event) =>
                      setSettings((previous) => ({
                        ...previous,
                        lowStockLimit: Number(event.target.value),
                      }))
                    }
                    className="w-full border p-3 rounded-xl"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-black">🔔 Notification Settings</h3>

                <p className="text-slate-500 mt-1">
                  Control which notification categories are enabled for the
                  store.
                </p>

                <div className="space-y-4 mt-6">
                  <label className="flex items-center justify-between border rounded-xl p-5">
                    <div>
                      <p className="font-black">📦 Order Notifications</p>

                      <p className="text-sm text-slate-500">
                        Notify customers about order status changes.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={settings.orderNotifications}
                      onChange={(event) =>
                        setSettings((previous) => ({
                          ...previous,
                          orderNotifications: event.target.checked,
                        }))
                      }
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between border rounded-xl p-5">
                    <div>
                      <p className="font-black">💳 Payment Notifications</p>

                      <p className="text-sm text-slate-500">
                        Enable payment-related notifications.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={settings.paymentNotifications}
                      onChange={(event) =>
                        setSettings((previous) => ({
                          ...previous,
                          paymentNotifications: event.target.checked,
                        }))
                      }
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between border rounded-xl p-5">
                    <div>
                      <p className="font-black">🎟️ Promotion Notifications</p>

                      <p className="text-sm text-slate-500">
                        Allow promotional messages to customers.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={settings.promotionNotifications}
                      onChange={(event) =>
                        setSettings((previous) => ({
                          ...previous,
                          promotionNotifications: event.target.checked,
                        }))
                      }
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between border rounded-xl p-5">
                    <div>
                      <p className="font-black">⚙️ System Notifications</p>

                      <p className="text-sm text-slate-500">
                        Enable system and maintenance messages.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={settings.systemNotifications}
                      onChange={(event) =>
                        setSettings((previous) => ({
                          ...previous,
                          systemNotifications: event.target.checked,
                        }))
                      }
                      className="w-5 h-5"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-black">📊 Dashboard Preferences</h3>

                <div className="space-y-4 mt-6">
                  <label className="flex items-center justify-between border rounded-xl p-5">
                    <div>
                      <p className="font-black">Auto Refresh</p>

                      <p className="text-sm text-slate-500">
                        Refresh dashboard every 30 seconds.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={settings.autoRefresh}
                      onChange={(event) =>
                        setSettings((previous) => ({
                          ...previous,
                          autoRefresh: event.target.checked,
                        }))
                      }
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between border rounded-xl p-5">
                    <div>
                      <p className="font-black">Maintenance Mode</p>

                      <p className="text-sm text-slate-500">
                        Store maintenance flag.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(event) =>
                        setSettings((previous) => ({
                          ...previous,
                          maintenanceMode: event.target.checked,
                        }))
                      }
                      className="w-5 h-5"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSettings(defaultSettings)}
                  className="bg-slate-200 px-6 py-3 rounded-xl font-bold"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={saveSettings}
                  className="bg-blue-600 text-white px-7 py-3 rounded-xl font-black"
                >
                  💾 Save Settings
                </button>
              </div>

              {settingsSaved && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 font-bold">
                  ✅ Settings saved successfully.
                </div>
              )}
            </div>
          )}

          {/* =================================================
              CATEGORY PANEL
          ================================================= */}

          {showCategoryPanel && (
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between mb-6">
                <div>
                  <p className="text-blue-600 uppercase text-xs font-black">
                    Store
                  </p>

                  <h2 className="text-2xl font-black">🏷️ Categories</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCategoryPanel(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 font-black"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((category) => {
                  const count = products.filter(
                    (product) =>
                      String(product.category_id) === String(category.id),
                  ).length;

                  return (
                    <div
                      key={category.id}
                      className="bg-slate-50 border rounded-2xl p-5"
                    >
                      <div className="flex justify-between">
                        <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                          🏷️
                        </div>

                        <span className="bg-white px-3 py-1 rounded-full font-black">
                          {count}
                        </span>
                      </div>

                      <h3 className="font-black text-lg mt-4">
                        {category.name}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {count === 1 ? "1 product" : `${count} products`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =================================================
          ORDER DETAILS MODAL
      ================================================= */}

      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <p className="text-blue-600 uppercase text-xs font-black">
                  Order Information
                </p>

                <h2 className="text-2xl font-black">
                  🧾 Order #{selectedOrder[0]?.order_id || "-"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeOrderDetails}
                className="w-10 h-10 rounded-full bg-slate-100 font-black"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-5">
                  <p className="text-sm text-slate-500">Customer</p>

                  <p className="font-black mt-1">
                    {selectedOrder[0]?.user_name ||
                      `${selectedOrder[0]?.first_name || ""} ${
                        selectedOrder[0]?.last_name || ""
                      }`.trim() ||
                      "Unknown"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                  <p className="text-sm text-slate-500">Email</p>

                  <p className="font-black mt-1">
                    {selectedOrder[0]?.email || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                  <p className="text-sm text-slate-500">Phone</p>

                  <p className="font-black mt-1">
                    {selectedOrder[0]?.phone || "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                  <p className="text-sm text-slate-500">Payment</p>

                  <p className="font-black mt-1 capitalize">
                    {selectedOrder[0]?.payment_method || "-"}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-5 md:col-span-2">
                  <p className="text-sm text-slate-500">Delivery Address</p>

                  <p className="font-black mt-1">
                    {selectedOrder[0]?.address || ""}

                    {selectedOrder[0]?.city ? `, ${selectedOrder[0].city}` : ""}

                    {selectedOrder[0]?.country
                      ? `, ${selectedOrder[0].country}`
                      : ""}
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-black mt-8 mb-4">Ordered Products</h3>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-4 text-left">Product</th>

                      <th className="p-4 text-left">Quantity</th>

                      <th className="p-4 text-left">Price</th>

                      <th className="p-4 text-left">Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedOrder.map((item, index) => {
                      const price = Number(item.item_price || 0);

                      const quantity = Number(item.quantity || 0);

                      return (
                        <tr
                          key={`${item.product_id}-${index}`}
                          className="border-t"
                        >
                          <td className="p-4 font-bold">
                            {item.product_name || "-"}
                          </td>

                          <td className="p-4">{quantity}</td>

                          <td className="p-4">{money(price)}</td>

                          <td className="p-4 font-black text-green-600">
                            {money(price * quantity)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-6">
                <div className="bg-slate-50 rounded-2xl p-6">
                  <p className="text-slate-500">Order Total</p>

                  <p className="text-3xl font-black text-green-600">
                    {money(selectedOrder[0]?.order_total)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          CUSTOMER MODAL
      ================================================= */}

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl">
            <div className="p-6 border-b flex justify-between">
              <div>
                <p className="text-blue-600 uppercase text-xs font-black">
                  Customer Profile
                </p>

                <h2 className="text-2xl font-black">
                  👤 {selectedCustomer.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="w-10 h-10 rounded-full bg-slate-100 font-black"
              >
                ×
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-xl">
                <p className="text-sm text-slate-500">Name</p>

                <p className="font-black mt-1">{selectedCustomer.name}</p>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl">
                <p className="text-sm text-slate-500">Email</p>

                <p className="font-black mt-1">{selectedCustomer.email}</p>
              </div>

              <div className="bg-blue-50 p-5 rounded-xl">
                <p className="text-sm text-slate-500">Orders</p>

                <p className="text-3xl font-black text-blue-600 mt-1">
                  {Number(selectedCustomer.total_orders || 0)}
                </p>
              </div>

              <div className="bg-green-50 p-5 rounded-xl">
                <p className="text-sm text-slate-500">Total Spent</p>

                <p className="text-2xl font-black text-green-600 mt-1">
                  {money(selectedCustomer.total_spent)}
                </p>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={() => openNotificationForCustomer(selectedCustomer)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black"
              >
                🔔 Notify
              </button>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="bg-slate-800 text-white px-7 py-3 rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          ADMIN MODAL
      ================================================= */}

      {selectedAdmin && (
        <div className="fixed inset-0 bg-black/60 z-[95] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl">
            <div className="p-6 border-b flex justify-between">
              <div>
                <p className="text-blue-600 uppercase text-xs font-black">
                  Administrator
                </p>

                <h2 className="text-2xl font-black">👤 {selectedAdmin.name}</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAdmin(null)}
                className="w-10 h-10 rounded-full bg-slate-100 font-black"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 bg-blue-50 rounded-2xl p-5 mb-5">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl">
                  👤
                </div>

                <div>
                  <p className="text-lg font-black">{selectedAdmin.name}</p>

                  <p className="text-slate-500 text-sm">
                    {selectedAdmin.email}
                  </p>

                  <span className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                    {selectedAdmin.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-xl">
                  <p className="text-sm text-slate-500">Name</p>

                  <p className="font-black mt-1">{selectedAdmin.name}</p>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl">
                  <p className="text-sm text-slate-500">Email</p>

                  <p className="font-black mt-1">{selectedAdmin.email}</p>
                </div>

                <div className="bg-green-50 p-5 rounded-xl">
                  <p className="text-sm text-slate-500">Role</p>

                  <p className="font-black text-green-700 mt-1">
                    {selectedAdmin.role}
                  </p>
                </div>

                <div className="bg-blue-50 p-5 rounded-xl">
                  <p className="text-sm text-slate-500">Admin ID</p>

                  <p className="font-black text-blue-700 mt-1">
                    #{selectedAdmin.id}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAdmin(null)}
                className="bg-slate-800 text-white px-7 py-3 rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
