import ContactForm from "../shared/ContactForm";

const Demo = () => {
  return (
    <section className="mt-10" id="demo">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 text-3xl md:text-5xl  text-center font-raleway font-bold">
          See It for Yourself
        </h2>
        <div className="flex items-center justify-center mx-auto max-w-[600px] mb-10">
          <p className="">
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
