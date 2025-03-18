const AccountDeactivated = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-md text-center">
        <h2 className="text-2xl font-semibold text-red-600">
          Account Deactivated
        </h2>
        <p className="text-gray-700 mt-3">
          This account has been deactivated. Please contact support or the
          account owner for assistance.
        </p>
      </div>
    </div>
  );
};

export default AccountDeactivated;
