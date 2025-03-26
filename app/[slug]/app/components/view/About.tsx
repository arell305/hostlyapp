interface AboutProps {
  description: string | null;
}

const About: React.FC<AboutProps> = ({ description }) => {
  if (description) {
    return (
      <div className="bg-white flex flex-col  rounded border border-altGray w-[95%] py-3 px-7 shadow mx-auto">
        <h2 className="text-2xl font-bold mb-1 text-start ">About</h2>
        <p className="text-base md:text-sm ">{description}</p>
      </div>
    );
  }
};

export default About;
