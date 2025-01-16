interface AboutProps {
  description: string | null;
}

const About: React.FC<AboutProps> = ({ description }) => {
  if (description) {
    return (
      <div className="bg-white flex flex-col  rounded border border-altGray w-[400px] p-3 shadow">
        <h2 className="text-2xl font-bold mb-4 text-center md:text-start">
          About
        </h2>
        <p className="text-lg ">{description}</p>
      </div>
    );
  }
};

export default About;
