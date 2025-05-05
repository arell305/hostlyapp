interface AboutProps {
  description: string | null;
}

const About: React.FC<AboutProps> = ({ description }) => {
  if (description) {
    return (
      <div className="flex flex-col rounded border w-[350px] py-3 px-7 shadow mx-auto self-start">
        <h2 className="text-2xl font-bold mb-1 text-start ">About</h2>
        <p className="text-base md:text-sm ">{description}</p>
      </div>
    );
  }
};

export default About;
