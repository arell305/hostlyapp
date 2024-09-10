import ContactForm from "../shared/ContactForm";

const Demo = () => {
  return (
    <section className="mt-10" id="demo">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-4xl md:text-5xl lg:text-6xl font-medium mb-6 ">
          See It for Yourself
        </h2>
        <div className="flex items-center justify-center mb-6">
          <p className="text-lg md:text-xl w-[900px]">
            Ready to see what our app can do for you? Schedule a demo to get a
            walkthrough of our features and discover how we can streamline your
            event management.
          </p>
        </div>
        <div className="mb-10 flex justify-center">
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default Demo;
