import { Link } from "react-router-dom";
import Carouseles from "../../share/component/Carousel";
import "../style/Home.scss";
import { useEffect, useState } from "react";
import productService from "../../services/productService";
import { getAllManufacturer } from "../../services/manufacturerService";
import ReduxStateExport from "../../redux/redux-state";

const imgURL = process.env.REACT_APP_IMG_URL;

const Home = () => {
  const { userInfo } = ReduxStateExport();
  const [products, setListProduct] = useState([]);
  const [manufacturers, setListManufacturer] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [visibleCount, setVisibleCount] = useState(10); // Số lượng sản phẩm hiển thị ban đầu
  const [viewedProducts, setViewedProducts] = useState([]);


  useEffect(() => {
    const key = userInfo?.manguoidung
      ? `viewedProducts_${userInfo.manguoidung}`
      : "viewedProducts_guest";

    const data = JSON.parse(localStorage.getItem(key)) || [];
    setViewedProducts(data);
  }, [userInfo]);

  useEffect(() => {
    fetchListProduct();
    fetchListManufacturer();
  }, []);

  const fetchListProduct = async () => {
    try {
      const response = await productService.getAllProducts();
      if (response.EC === 1) {
        setListProduct(response.DT.activeProducts);
      } else {
        console.error("Failed to fetch");
      }
    } catch (err) {
      console.error("Error occurred", err);
    }
  };

  const fetchListManufacturer = async () => {
    try {
      const response = await getAllManufacturer();
      if (response.EC === 1) {
        setListManufacturer(response.DT.allManufacturer);
      } else {
        console.error("Failed to fetch");
      }
    } catch (err) {
      console.error("Error occurred", err);
    }
  };

  const filteredProducts = products.filter((item) => {
    const matchesCategory = selectedManufacturer
      ? item.tenthuonghieu === selectedManufacturer
      : true;

    const matchesSearch = item.tensanpham
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesPrice = (() => {
      if (selectedPriceRange === "under5") return item.giaban < 5000000;
      if (selectedPriceRange === "5to10")
        return item.giaban >= 5000000 && item.giaban <= 10000000;
      if (selectedPriceRange === "10to15")
        return item.giaban > 10000000 && item.giaban <= 15000000;
      if (selectedPriceRange === "above15") return item.giaban > 15000000;
      return true;
    })();

    return matchesCategory && matchesSearch && matchesPrice;
  });

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10); // Tăng số lượng sản phẩm hiển thị thêm 10
  };

  const removeProduct = (masanpham) => {
    const key = userInfo?.manguoidung
      ? `viewedProducts_${userInfo.manguoidung}`
      : "viewedProducts_guest";

    const updated = viewedProducts.filter(
      (item) => item.masanpham !== masanpham
    );

    setViewedProducts(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  return (
    <>
      <Carouseles />
      <div className="container product-container mb-4">
        <div className="d-flex gap-3 my-4">
          {/* <div className="col-2 mt-4 ms-4">
            <input
              type="text"
              placeholder="Tìm kiếm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ marginLeft: '18px' }}
            />
          </div> */}

          <div className="col-2 mt-4 ms-3">
            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="form-select"
            >
              <option value="">Tất cả thương hiệu</option>
              {manufacturers &&
                manufacturers.map((manu, index) => (
                  <option key={index} value={manu.tenthuonghieu}>
                    {manu.tenthuonghieu}
                  </option>
                ))}
            </select>
          </div>
          <div className="col-2 mt-4 ms-3">
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="form-select"
            >
              <option value="">Tất cả giá</option>
              <option value="under5">Dưới 5 triệu</option>
              <option value="5to10">5 - 10 triệu</option>
              <option value="10to15">10 - 15 triệu</option>
              <option value="above15">Trên 15 triệu</option>
            </select>
          </div>
        </div>

        {viewedProducts.length > 0 && (
          <>
            <h5 className="text-lg font-bold mb-3 px-3">Sản phẩm đã xem</h5>
            <div className="viewed-section my-4 p-3 bg-white rounded-xl shadow">
              <div className="d-flex gap-3">
                {viewedProducts.map((product) => (
                  <div
                    key={product.masanpham}
                    className="viewed-item relative flex items-center border rounded-lg p-2 bg-white shadow-sm"
                  >
                    {/* nút X */}
                    <span
                      onClick={() => removeProduct(product.masanpham)}
                      className="icon-delete top-1 right-1 bg-gray-200 hover:bg-red-500 hover:text-white rounded-full p-1"
                    >
                      X
                    </span>
                    {console.log("product", product)}
                    <Link
                      to={`/product-details/${product.masanpham}`}
                      className="d-flex gap-2 items-center w-full text-decoration-none"
                    >
                      {/* ảnh bên trái */}
                      <img
                        src={`${imgURL}${product?.hinhanh?.split(',')[0]}`}
                        alt={product.tensanpham}
                        className="viewed-thumb"
                      />

                      {/* nội dung bên phải */}
                      <div className="viewed-info ml-3 flex flex-col justify-content-between">
                        <div className="product-seen-info">
                          <h3 className="product-seen-name">{product.tensanpham} {product.ram}/{product.dungluong}</h3>
                        </div>
                        <span className="product-seen-price">
                          {product.khuyenmai > 0
                            ? Number(product.giasaugiam).toLocaleString("vi-VN") + "₫"
                            : Number(product.giaban).toLocaleString("vi-VN") + "₫"}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {console.log("filteredProducts", filteredProducts)}
        <div className="product-list">
          {filteredProducts && filteredProducts.length > 0 ? (
            filteredProducts.slice(0, visibleCount).map((product, index) => (
              <Link
                to={`/product-details/${product.masanpham}`}
                className="text-decoration-none"
                key={product.masanpham}
              >
                <div className="product-card">
                  <div className="product-image-wrapper">
                    {product.khuyenmai > 0 && (
                      <div className="discount-badge">-{product.khuyenmai}%</div>
                    )}
                    <img
                      src={`${imgURL}${product.hinhanh.split(',')[0]}`}
                      className="product-image"
                      alt={product.tensanpham || "Hình ảnh sản phẩm"}
                    />
                  </div>

                  <h3 className="product-name">{product.tensanpham}</h3>
                  <p className="product-specs">
                    {product.ram} / {product.dungluong}
                  </p>

                  {/* Hiển thị giá song song */}
                  <div className="price-row">
                    {product.khuyenmai > 0 ? (
                      <>
                        <span className="old-price">
                          {Number(product.giaban).toLocaleString("vi-VN")}
                          <sup><u>đ</u></sup>
                        </span>
                        <span className="discount-price">
                          {Number(product.giasaugiam).toLocaleString("vi-VN")}
                          <sup><u>đ</u></sup>
                        </span>
                      </>
                    ) : (
                      <span className="discount-price">
                        {Number(product.giaban).toLocaleString("vi-VN")}
                        <sup><u>đ</u></sup>
                      </span>
                    )}
                  </div>
                  <button className="buy-now-button">Mua ngay</button>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-12">"Không có sản phẩm"</div>
          )}
        </div>
        {visibleCount < filteredProducts.length && (
          <div className="text-center">
            <div
              className="pb-4"
              style={{ fontSize: '18px', cursor: 'pointer' }}
              onClick={handleShowMore}
            >
              Xem thêm
              <i className="fa-solid fa-caret-down ms-2"></i>
            </div>
          </div>
        )}
      </div >
    </>
  );
};

export default Home;
