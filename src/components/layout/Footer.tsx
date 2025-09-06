const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p>© {new Date().getFullYear()} Fake Device. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
