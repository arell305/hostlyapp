function Confirmation() {
  return (
    <div className="bg-gradient-to-b from-customDarkBlue to-customPrimaryBlue h-[calc(100dvh)] flex justify-center items-center overflow-hidden">
      <div className="p-8 md:p-14 bg-white flex flex-col h-[70vh] md:h-[85%] w-[90%] md:w-[70%] max-w-[800px] max-h-[600px] rounded-xl shadow-md ">
        <h1 className="text-[160px]      text-center">📩</h1>

        <h1 className=" text-4xl md:text-6xl font-semibold  text-center">
          Congratulations!
        </h1>
        <p className="text-center mt-4 md:mt-8 md:text-xl">
          Your order was successful, and we&apos;re excited to have you onboard!
          You&apos;ll receive an <span className="font-bold">email</span>{" "}
          shortly with everything you need to get started with our app.
        </p>
        <p></p>
      </div>
    </div>
  );
}

export default Confirmation;
