import React from "react";

const ProductTable = ({
  productList,
  setProductList,
  grossAmt,
  setGrossAmt,
  setGSTAMT,
  gst
}) => {
  const handleDeleteProduct = (index: number) => {
    if (index > -1) {
      let deletedObj = productList[index];

      // remove deleted product and calculate amount gross amount and total amount
      let newGrossAmt = grossAmt - deletedObj.amount;
      setGrossAmt(newGrossAmt);

      // convert gst percentage to rupees
      const gstInRupee = (newGrossAmt * gst) / 100;
      setGSTAMT(gstInRupee);

      setProductList(
        productList.slice(0, index).concat(productList.slice(index + 1))
      );
    }
  };

  return (
    <div className=" overflow-x-auto shadow-md sm:rounded-lg h-[15rem] bg-primary-200 border border-primary-500 ">
      <table className="w-full text-sm text-left rtl:text-right text-primary-500">
        <thead className="text-xs text-white uppercase bg-primary-800">
          <tr>
            <th scope="col" className="pl-6 py-2">
              Product Name
            </th>
            <th scope="col" className="pl-3 py-2">
              Category
            </th>
            <th scope="col" className="pl-3 py-2">
              Rate
            </th>
            <th scope="col" className="pl-3 py-2">
              Net Weight
            </th>
            <th scope="col" className="pl-3 py-2">
              Quantity
            </th>
            <th scope="col" className="pl-3 py-2">
              Making(%)
            </th>
            <th scope="col" className="pl-3 py-2">
              Amount
            </th>
            <th scope="col" className="pl-6 py-2">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {productList?.map((product, index) => {
            return (
              <tr
                key={index}
                className="bg-primary-100 text-primary-900 border-b border-primary-500 cursor-pointer"
              >
                <th
                  scope="row"
                  className="pl-6 py-2 font-medium whitespace-nowrap capitalize"
                >
                  {product.productName}
                </th>
                <td className="pl-4 py-2">{product.productCategory}</td>
                <td className="pl-4 py-2">{product.rate}</td>
                <td className="pl-4 py-2">{product.netWeight}</td>
                <td className="pl-4 py-2">{product.quantity}</td>
                <td className="pl-4 py-2">{product.makingCost}</td>
                <td className="pl-3 py-2">{`₹ ${product.amount}`}</td>
                <td className="pl-3 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteProduct(index);
                    }}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
